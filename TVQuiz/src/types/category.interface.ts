export type ArtworkShape = 'wide' | 'square' | 'tall';

export interface Artwork {
  url: string;
  shape: ArtworkShape;
}

export interface Category {
  id: string;
  name: string;
  artwork: Artwork;
}
