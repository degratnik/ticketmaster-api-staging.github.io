import without from 'lodash/without';

export const ATTRIBUTE_NAMES = {
  ID: 'w-id',
  WIDGET_TYPE: 'w-type',
  DEFAULT_VALUE: 'data-default-value',
  WIDGET_THEME: 'w-theme',
  WIDGET_LAYOUT: 'w-layout',
  WIDGET_HEIGHT: 'w-height',
  WIDGET_BORDER: 'w-border',
  WIDGET_EVENTS_PERIOD: 'w-period',
  WIDGET_EVENTS_DATE_FROM: 'w-startdatetime',
  WIDGET_EVENTS_DATE_TO: 'w-enddatetime',

  TITLE_COLOR: 'w-titleColor',
  TITLE_HOVER_COLOR: 'w-titleHoverColor',
  ARROW_COLOR: 'w-arrowColor',
  ARROW_HOVER_COLOR: 'w-arrowHoverColor',
  EVENT_DATE_COLOR: 'w-dateColor',
  EVENT_DESCRIPTION_COLOR: 'w-descriptionColor',
  EVENTS_COUNTER_COLOR: 'w-counterColor',
  BORDER_COLOR: 'w-bordercolor',
  BACKGROUND_COLOR: 'w-backgroundcolor',
};

export const ATTRIBUTE_VALUES = {
  WIDGET_THEME: {
    SIMPLE: 'simple',
    OLD_SCHOOL: 'oldschool',
    NEW_SCHOOL: 'newschool',
    LIST_VIEW: 'listview',
    LIST_VIEW_THUMBNAILS: 'listviewthumbnails',
  },
  WIDGET_LAYOUT: {
    HORIZONTAL: 'horizontal',
  },
  WIDGET_EVENTS_PERIOD: {
    CUSTOM: 'custom',
  },
};

export const CUSTOM_THEME_ATTRIBUTES = [
  ATTRIBUTE_NAMES.TITLE_COLOR,
  ATTRIBUTE_NAMES.TITLE_HOVER_COLOR,
  ATTRIBUTE_NAMES.ARROW_COLOR,
  ATTRIBUTE_NAMES.ARROW_HOVER_COLOR,
  ATTRIBUTE_NAMES.EVENT_DATE_COLOR,
  ATTRIBUTE_NAMES.EVENT_DESCRIPTION_COLOR,
  ATTRIBUTE_NAMES.EVENTS_COUNTER_COLOR,
  ATTRIBUTE_NAMES.BORDER_COLOR,
  ATTRIBUTE_NAMES.BACKGROUND_COLOR,
];

export const AVAILABLE_CUSTOM_FIELDS_FOR_THEME = {
  [ATTRIBUTE_VALUES.WIDGET_THEME.SIMPLE]: without(CUSTOM_THEME_ATTRIBUTES, ATTRIBUTE_NAMES.BACKGROUND_COLOR),
  [ATTRIBUTE_VALUES.WIDGET_THEME.OLD_SCHOOL]: CUSTOM_THEME_ATTRIBUTES,
  [ATTRIBUTE_VALUES.WIDGET_THEME.NEW_SCHOOL]: CUSTOM_THEME_ATTRIBUTES,
  [ATTRIBUTE_VALUES.WIDGET_THEME.LIST_VIEW]: without(CUSTOM_THEME_ATTRIBUTES, ATTRIBUTE_NAMES.ARROW_COLOR, ATTRIBUTE_NAMES.ARROW_HOVER_COLOR),
  [ATTRIBUTE_VALUES.WIDGET_THEME.LIST_VIEW_THUMBNAILS]: without(CUSTOM_THEME_ATTRIBUTES, ATTRIBUTE_NAMES.ARROW_COLOR, ATTRIBUTE_NAMES.ARROW_HOVER_COLOR),
};
