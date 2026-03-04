import { Prop, PropOption } from '@/types/props';

export function parsePropsCSV(csv: string, projectId: string): Prop[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    return {
      id: crypto.randomUUID(),
      projectId,
      propName: cols[0] || 'Untitled',
      description: cols[1] || '',
      quantity: parseInt(cols[2]) || 1,
      priority: (['low', 'medium', 'high', 'urgent'].includes(cols[3]) ? cols[3] : 'medium') as Prop['priority'],
      sceneOrReference: cols[4] || '',
      treatmentDocUrl: '',
      tags: cols[5] ? cols[5].split(';').map(t => t.trim()).filter(Boolean) : [],
      searchQueryOverride: '',
      status: 'not_searched',
      createdAt: new Date().toISOString(),
    };
  });
}

export function exportPurchasingCSV(items: { prop: Prop; option: PropOption }[]): string {
  const header = 'Prop,Title,ASIN,Qty,Unit Price (£),Total (£),Delivery,URL';
  const rows = items.map(({ prop, option }) =>
    [
      `"${prop.propName}"`,
      `"${option.title}"`,
      option.asin,
      prop.quantity,
      option.priceAmount.toFixed(2),
      (option.priceAmount * prop.quantity).toFixed(2),
      option.expectedDeliveryIso,
      option.url,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

export const SAMPLE_CSV = `prop_name,description,quantity,priority,scene_reference,tags
"Vintage Rotary Phone","Red rotary telephone, 1960s style",1,high,"Scene 3 - Office","vintage;telephone;red"
"Crystal Whiskey Glasses","Set of 4 old fashioned tumblers",2,medium,"Scene 5 - Bar","glassware;bar;crystal"
"Leather Briefcase","Brown worn leather briefcase",1,high,"Scene 1 - Opening","leather;briefcase;vintage"
"Desk Lamp","Art deco brass desk lamp",1,low,"Scene 3 - Office","lighting;desk;brass"
"Polaroid Camera","Instant camera, retro style",1,medium,"Scene 7 - Party","camera;retro;prop"`;
