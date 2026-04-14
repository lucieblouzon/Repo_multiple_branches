import type { Schema, Struct } from '@strapi/strapi';

export interface SharedFaqEntry extends Struct.ComponentSchema {
  collectionName: 'components_shared_faq_entries';
  info: {
    description: 'A question and answer pair';
    displayName: 'FAQ Entry';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.RichText & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedFeature extends Struct.ComponentSchema {
  collectionName: 'components_shared_features';
  info: {
    description: 'A product feature';
    displayName: 'Feature';
    icon: 'star';
  };
  attributes: {
    isHighlighted: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String;
  };
}

export interface SharedLocation extends Struct.ComponentSchema {
  collectionName: 'components_shared_locations';
  info: {
    description: 'A physical location';
    displayName: 'Location';
    icon: 'pinMap';
  };
  attributes: {
    address: Schema.Attribute.String;
    city: Schema.Attribute.String;
    country: Schema.Attribute.String;
    latitude: Schema.Attribute.Float;
    longitude: Schema.Attribute.Float;
    venue: Schema.Attribute.String;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedScheduleEntry extends Struct.ComponentSchema {
  collectionName: 'components_shared_schedule_entries';
  info: {
    description: 'A time slot in an event schedule';
    displayName: 'Schedule Entry';
    icon: 'clock';
  };
  attributes: {
    description: Schema.Attribute.Text;
    endTime: Schema.Attribute.Time;
    speaker: Schema.Attribute.String;
    startTime: Schema.Attribute.Time & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.faq-entry': SharedFaqEntry;
      'shared.feature': SharedFeature;
      'shared.location': SharedLocation;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.schedule-entry': SharedScheduleEntry;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
    }
  }
}
