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

export const processAllData = (data: any) => {
  const peopleMap = new Map<string, PersonRecord>();
  const allEvents: TimelineEvent[] = [];

  const getOrAddPerson = (rawName: string) => {
    const id = normalizeName(rawName);
    if (!peopleMap.has(id)) {
      peopleMap.set(id, { id, displayName: rawName, events: [], connections: new Set(), suspicionScore: 0 });
    }
    return peopleMap.get(id)!;
  };

  // 1. Checkins
  data.checkins?.forEach((item: any) => {
    const p = getOrAddPerson(item.personName);
    const event: TimelineEvent = {
      id: item.id, type: "checkin", dateObj: parseCustomDate(item.timestamp),
      displayTime: item.timestamp, primaryPerson: p.id, location: item.location, rawData: item
    };
    p.events.push(event);
    allEvents.push(event);
  });

  // 2. Messages
  data.messages?.forEach((item: any) => {
    const s = getOrAddPerson(item.senderName);
    const r = getOrAddPerson(item.recipientName);
    const event: TimelineEvent = {
      id: item.id, type: "message", dateObj: parseCustomDate(item.timestamp),
      displayTime: item.timestamp, primaryPerson: s.id, relatedPerson: r.id, content: item.message, rawData: item
    };
    s.events.push(event);
    r.events.push(event);
    s.connections.add(r.displayName);
    r.connections.add(s.displayName);
    allEvents.push(event);
  });

  // 3. Sightings (Podo ile görülenler en şüphelidir)
  data.sightings?.forEach((item: any) => {
    const p1 = getOrAddPerson(item.personName);
    const p2 = getOrAddPerson(item.seenWith);
    const event: TimelineEvent = {
      id: item.id, type: "sighting", dateObj: parseCustomDate(item.timestamp),
      displayTime: item.timestamp, primaryPerson: p1.id, relatedPerson: p2.id, location: item.location, rawData: item
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
  data.notes?.forEach((item: any) => {
    if(!item.authorName) return;
    const p = getOrAddPerson(item.authorName);
    const event: TimelineEvent = { id: item.id, type: "note", dateObj: parseCustomDate(item.timestamp), displayTime: item.timestamp, primaryPerson: p.id, location: item.location, content: item.note, rawData: item };
    p.events.push(event);
    allEvents.push(event);
  });

  // 5. Tips (İsimsiz İhbarlar)
  data.tips?.forEach((item: any) => {
    if(!item.targetPerson) return;
    const target = getOrAddPerson(item.targetPerson);
    const event: TimelineEvent = { 
      id: item.id, type: "tip", dateObj: parseCustomDate(item.timestamp), 
      displayTime: item.timestamp, primaryPerson: target.id, location: item.location, 
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

  return {
    people: Array.from(peopleMap.values()).sort((a, b) => b.suspicionScore - a.suspicionScore),
    timeline: allEvents.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
  };
};