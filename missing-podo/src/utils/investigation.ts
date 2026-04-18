// src/utils/investigation.ts

export type EventType = "checkin" | "message" | "sighting" | "note" | "tip";

export interface TimelineEvent {
  id: string;
  type: EventType;
  dateObj: Date;
  displayTime: string;
  primaryPerson: string;
  relatedPerson?: string;
  location?: string;
  coordinates?: string; // Raw "lat,lng" string from API
  content?: string;
  reliability?: string; // Sadece Tips için
  rawData: any;
}

export interface PersonRecord {
  id: string;
  displayName: string;
  events: TimelineEvent[];
  connections: Set<string>;
  suspicionScore: number;
}

const parseCustomDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const [datePart, timePart] = dateStr.split(" ");
  const [day, month, year] = datePart.split("-");
  return new Date(`${year}-${month}-${day}T${timePart}:00`);
};

export const normalizeName = (name: string): string => {
  if (!name) return "unknown";
  return name.toLowerCase().replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c").trim();
};

import { findDuplicates } from "./levenshtein";

export const processAllData = (data: any, mergePairs: Record<string, string> = {}) => {
  const peopleMap = new Map<string, PersonRecord>();
  const allEvents: TimelineEvent[] = [];

  const getOrAddPerson = (rawName: string) => {
    // Apply merge redirects
    let canonicalName = rawName;
    while (mergePairs[canonicalName]) {
       canonicalName = mergePairs[canonicalName];
    }
    
    let id = normalizeName(canonicalName);
    // Hard override if the id has a merge redirect (case where the state specifies ids)
    while (mergePairs[id]) {
       id = mergePairs[id];
       canonicalName = id; // Fallback display name for generic merged ids
    }

    if (!peopleMap.has(id)) {
      peopleMap.set(id, { id, displayName: canonicalName, events: [], connections: new Set(), suspicionScore: 0 });
    }
    return peopleMap.get(id)!;
  };

  // 1. Checkins
  data.checkins?.forEach((item: any) => {
    const p = getOrAddPerson(item.personName);
    const event: TimelineEvent = {
      id: item.id, type: "checkin", dateObj: parseCustomDate(item.timestamp),
      displayTime: item.timestamp, primaryPerson: p.id,
      location: item.location, coordinates: item.coordinates,
      content: item.note, // note field in checkins
      rawData: item
    };
    p.events.push(event);
    allEvents.push(event);
  });

  // 2. Messages — API field is 'text', not 'message'
  data.messages?.forEach((item: any) => {
    const s = getOrAddPerson(item.senderName);
    const r = getOrAddPerson(item.recipientName);
    const event: TimelineEvent = {
      id: item.id, type: "message", dateObj: parseCustomDate(item.timestamp),
      displayTime: item.timestamp, primaryPerson: s.id, relatedPerson: r.id,
      location: item.location, coordinates: item.coordinates,
      content: item.text || item.message, // API uses 'text' field
      rawData: item
    };
    s.events.push(event);
    r.events.push(event);
    s.connections.add(r.displayName);
    r.connections.add(s.displayName);
    allEvents.push(event);
  });

  // 3. Sightings
  data.sightings?.forEach((item: any) => {
    const p1 = getOrAddPerson(item.personName);
    const p2 = getOrAddPerson(item.seenWith);
    const event: TimelineEvent = {
      id: item.id, type: "sighting", dateObj: parseCustomDate(item.timestamp),
      displayTime: item.timestamp, primaryPerson: p1.id, relatedPerson: p2.id,
      location: item.location, coordinates: item.coordinates,
      content: item.note, rawData: item
    };
    p1.events.push(event);
    p2.events.push(event);
    p1.connections.add(p2.displayName);
    p2.connections.add(p1.displayName);
    // Podo ile görülenlerin şüphe puanını artır
    if (p1.id === 'podo' || p2.id === 'podo') {
       p1.suspicionScore += 25;
       p2.suspicionScore += 25;
    }
    allEvents.push(event);
  });
  // 4. Personal Notes
  data.notes?.forEach((item: any) => {
    if(!item.authorName) return;
    const p = getOrAddPerson(item.authorName);
    const event: TimelineEvent = {
      id: item.id, type: "note", dateObj: parseCustomDate(item.timestamp),
      displayTime: item.timestamp, primaryPerson: p.id,
      location: item.location, coordinates: item.coordinates,
      content: item.note, rawData: item
    };
    p.events.push(event);
    // mentionedPeople field — add connections
    if (item.mentionedPeople) {
      const mentioned = String(item.mentionedPeople).split(',').map((n: string) => n.trim()).filter(Boolean);
      mentioned.forEach((name: string) => {
        const mp = getOrAddPerson(name);
        p.connections.add(mp.displayName);
        mp.connections.add(p.displayName);
      });
    }
    allEvents.push(event);
  });

  // 5. Tips (İsimsiz İhbarlar)
  data.tips?.forEach((item: any) => {
    if(!item.targetPerson) return;
    const target = getOrAddPerson(item.targetPerson);
    const event: TimelineEvent = { 
      id: item.id, type: "tip", dateObj: parseCustomDate(item.timestamp), 
      displayTime: item.timestamp, primaryPerson: target.id,
      location: item.location, coordinates: item.coordinates,
      content: item.tipDetail, reliability: item.reliability, rawData: item 
    };
    target.events.push(event);
    allEvents.push(event);
    
    // İhbar edilen kişinin şüphesini güvenilirliğe göre artır
    if(item.reliability === 'Yüksek') target.suspicionScore += 10;
    else if(item.reliability === 'Orta') target.suspicionScore += 5;
  });

  // Şüphe Puanı Hesaplama (Basit Algoritma)
  peopleMap.forEach(person => {
    if (person.id === 'podo') return;
    person.suspicionScore += person.connections.size * 5;
    person.suspicionScore += person.events.filter(e => e.type === 'message').length * 2;
    person.suspicionScore = Math.min(person.suspicionScore, 100);
  });

  const peopleArray = Array.from(peopleMap.values()).sort((a, b) => b.suspicionScore - a.suspicionScore);
  const potentialDuplicates = findDuplicates(peopleArray.map(p => p.displayName));
  const duplicateIdPairs = potentialDuplicates.map(([nameA, nameB]) => {
     return {
        sourceId: normalizeName(nameB),
        sourceName: nameB,
        targetId: normalizeName(nameA),
        targetName: nameA
     };
  });

  return {
    people: peopleArray,
    timeline: allEvents.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()),
    duplicates: duplicateIdPairs
  };
};