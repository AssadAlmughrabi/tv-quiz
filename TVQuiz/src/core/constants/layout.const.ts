import { scale } from 'core/utils/scale.utils';

/** 5% of 1920x1080: TVs may crop the edges (overscan), so content stays inside. */
export const SAFE_AREA = {
  horizontal: scale(96),
  vertical: scale(54),
};

/**
 * Every card has the same frame. Artwork of any shape (wide, square, tall) is cropped
 * to fill it, so all cards in a rail line up. 440 wide also makes the 4th card peek at 1080p.
 */
export const CARD_WIDTH = scale(440);
export const CARD_IMAGE_HEIGHT = scale(248); // 16:9

export const CARD_GAP = scale(24);

export const CARD_BORDER = scale(4);
export const CARD_TITLE_LINE_HEIGHT = scale(32);
export const CARD_META_LINE_HEIGHT = scale(28);
export const CARD_TEXT_PADDING = scale(14);

/** Full card height: border + image + two title lines + one meta line. "See all" uses it too. */
export const CARD_HEIGHT =
  CARD_BORDER * 2 +
  CARD_IMAGE_HEIGHT +
  CARD_TEXT_PADDING * 2 +
  CARD_TITLE_LINE_HEIGHT * 2 +
  CARD_META_LINE_HEIGHT;

/** Width of the content area inside the safe margins. */
export const CONTENT_WIDTH = scale(1920) - SAFE_AREA.horizontal * 2;

/** Where the focused row sits when the page scrolls, measured from the top. */
export const FOCUSED_ROW_OFFSET = scale(120);

/** Daily quiz banner on Home. */
export const HERO_HEIGHT = scale(460);

export const TOP_BAR_HEIGHT = scale(96);
export const TOP_BAR_GAP = scale(28);

export const HOME_HEADER_HEIGHT =
  SAFE_AREA.vertical + TOP_BAR_HEIGHT + TOP_BAR_GAP + HERO_HEIGHT;

/** Height of a rail's title line. Fixed, so the skeleton and the real title take the same space. */
export const RAIL_TITLE_HEIGHT = scale(44);

/** Space above a rail's title. */
export const RAIL_TOP_SPACE = scale(40);
/** Space between a rail's title and its cards. */
export const RAIL_TITLE_GAP = scale(8);
/** Space above and below the cards, so the focus zoom is not clipped. */
export const RAIL_CARDS_PADDING = scale(20);

/**
 * Every rail on Home has exactly this height, in every state (loading, cards, empty, error).
 * Home's FlatList uses it to know where each rail is without measuring.
 */
export const RAIL_HEIGHT =
  RAIL_TOP_SPACE +
  RAIL_TITLE_HEIGHT +
  RAIL_TITLE_GAP +
  RAIL_CARDS_PADDING * 2 +
  CARD_HEIGHT;
