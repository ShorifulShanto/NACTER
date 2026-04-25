
import { guava } from './flavors/guava';
import { apple } from './flavors/apple';
import { strawberry } from './flavors/strawberry';
import { cherry } from './flavors/cherry';
import { orange } from './flavors/orange';
import { pineapple } from './flavors/pineapple';
import { grape } from './flavors/grape';

export interface Flavor {
  id: string;
  index: string;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  hex: string;
  accentHex: string;
  videoUrl: string;
  imageUrl: string;
}

export const flavors: Flavor[] = [
  guava,
  apple,
  strawberry,
  cherry,
  orange,
  pineapple,
  grape,
];
