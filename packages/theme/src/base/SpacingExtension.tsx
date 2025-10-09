/**
 * Spacing theme extension following Flutter EdgeInsets patterns.
 * Provides comprehensive spacing system using 4px base unit.
 */

export interface SpacingExtension {
  /** Spacing scale based on 4px base unit */
  spacing: SpacingScale;
  /** Component-specific spacing */
  components: ComponentSpacing;
}

export interface SpacingScale {
  /** 0px spacing */
  none: string;
  /** 1px spacing */
  px: string;
  /** 2px spacing */
  '0.5': string; // 2px
  /** 4px spacing */
  '1': string;   // 4px
  /** 8px spacing */
  '2': string;   // 8px
  /** 12px spacing */
  '3': string;   // 12px
  /** 16px spacing */
  '4': string;   // 16px
  /** 20px spacing */
  '5': string;   // 20px
  /** 24px spacing */
  '6': string;   // 24px
  /** 28px spacing */
  '7': string;   // 28px
  /** 32px spacing */
  '8': string;   // 32px
  /** 36px spacing */
  '9': string;   // 36px
  /** 40px spacing */
  '10': string;  // 40px
  /** 44px spacing */
  '11': string;  // 44px
  /** 48px spacing */
  '12': string;  // 48px
  /** 56px spacing */
  '14': string;  // 56px
  /** 64px spacing */
  '16': string;  // 64px
  /** 72px spacing */
  '18': string;  // 72px
  /** 80px spacing */
  '20': string;  // 80px
  /** 96px spacing */
  '24': string;  // 96px
  /** 112px spacing */
  '28': string;  // 112px
  /** 128px spacing */
  '32': string;  // 128px
  /** 144px spacing */
  '36': string;  // 144px
  /** 160px spacing */
  '40': string;  // 160px
  /** 176px spacing */
  '44': string;  // 176px
  /** 192px spacing */
  '48': string;  // 192px
  /** 208px spacing */
  '52': string;  // 208px
  /** 224px spacing */
  '56': string;  // 224px
  /** 240px spacing */
  '60': string;  // 240px
  /** 256px spacing */
  '64': string;  // 256px
  /** 288px spacing */
  '72': string;  // 288px
  /** 320px spacing */
  '80': string;  // 320px
  /** 384px spacing */
  '96': string;  // 384px
}

export interface ComponentSpacing {
  /** Button spacing */
  button: ButtonSpacing;
  /** Input spacing */
  input: InputSpacing;
  /** Card spacing */
  card: CardSpacing;
  /** Dialog spacing */
  dialog: DialogSpacing;
  /** Navigation spacing */
  navigation: NavigationSpacing;
  /** Layout spacing */
  layout: LayoutSpacing;
}

export interface ButtonSpacing {
  /** Button padding by size */
  padding: {
    sm: string;
    md: string;
    lg: string;
    icon: string;
  };
  /** Button gap between icon and text */
  gap: string;
  /** Button margin in groups */
  gapInGroup: string;
}

export interface InputSpacing {
  /** Input padding by size */
  padding: {
    sm: string;
    md: string;
    lg: string;
  };
  /** Input gap between prefix/suffix and text */
  gap: string;
  /** Input gap with label */
  gapWithLabel: string;
  /** Input gap with error message */
  gapWithError: string;
}

export interface CardSpacing {
  /** Card padding */
  padding: string;
  /** Card gap between header and content */
  gap: string;
  /** Card header padding */
  headerPadding: string;
  /** Card content padding */
  contentPadding: string;
  /** Card footer padding */
  footerPadding: string;
}

export interface DialogSpacing {
  /** Dialog padding */
  padding: string;
  /** Dialog gap between title and content */
  gap: string;
  /** Dialog title margin bottom */
  titleMarginBottom: string;
  /** Dialog content margin bottom */
  contentMarginBottom: string;
  /** Dialog button gap */
  buttonGap: string;
  /** Dialog overlay padding */
  overlayPadding: string;
}

export interface NavigationSpacing {
  /** Navigation item padding */
  itemPadding: string;
  /** Navigation gap between items */
  itemGap: string;
  /** Navigation section gap */
  sectionGap: string;
  /** Navigation logo padding */
  logoPadding: string;
  /** Navigation mobile padding */
  mobilePadding: string;
}

export interface LayoutSpacing {
  /** Container padding */
  containerPadding: string;
  /** Section padding */
  sectionPadding: string;
  /** Grid gap */
  gridGap: string;
  /** Stack gap */
  stackGap: string;
  /** Form field gap */
  formFieldGap: string;
}

/**
 * Default spacing extension following 8pt grid system.
 * Provides comprehensive spacing for all UI components.
 */
export const defaultSpacingExtension: SpacingExtension = {
  spacing: {
    none: '0',
    px: '1px',
    '0.5': '2px',
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '7': '28px',
    '8': '32px',
    '9': '36px',
    '10': '40px',
    '11': '44px',
    '12': '48px',
    '14': '56px',
    '16': '64px',
    '18': '72px',
    '20': '80px',
    '24': '96px',
    '28': '112px',
    '32': '128px',
    '36': '144px',
    '40': '160px',
    '44': '176px',
    '48': '192px',
    '52': '208px',
    '56': '224px',
    '60': '240px',
    '64': '256px',
    '72': '288px',
    '80': '320px',
    '96': '384px'
  },
  components: {
    button: {
      padding: {
        sm: '8px 12px',
        md: '10px 16px',
        lg: '12px 24px',
        icon: '8px'
      },
      gap: '8px',
      gapInGroup: '4px'
    },
    input: {
      padding: {
        sm: '8px 12px',
        md: '10px 14px',
        lg: '12px 16px'
      },
      gap: '8px',
      gapWithLabel: '4px',
      gapWithError: '4px'
    },
    card: {
      padding: '24px',
      gap: '16px',
      headerPadding: '0 0 16px 0',
      contentPadding: '0 0 16px 0',
      footerPadding: '16px 0 0 0'
    },
    dialog: {
      padding: '24px',
      gap: '16px',
      titleMarginBottom: '8px',
      contentMarginBottom: '24px',
      buttonGap: '12px',
      overlayPadding: '16px'
    },
    navigation: {
      itemPadding: '8px 12px',
      itemGap: '2px',
      sectionGap: '16px',
      logoPadding: '16px',
      mobilePadding: '12px'
    },
    layout: {
      containerPadding: '16px',
      sectionPadding: '48px',
      gridGap: '16px',
      stackGap: '8px',
      formFieldGap: '16px'
    }
  }
};

/**
 * Create a custom spacing extension by merging with default values.
 * Follows Flutter copyWith pattern for theme customization.
 */
export const createSpacingExtension = (overrides: Partial<SpacingExtension>): SpacingExtension => {
  return {
    spacing: { ...defaultSpacingExtension.spacing, ...overrides.spacing },
    components: {
      button: {
        padding: {
          ...defaultSpacingExtension.components.button.padding,
          ...overrides.components?.button?.padding
        },
        gap: overrides.components?.button?.gap ?? defaultSpacingExtension.components.button.gap,
        gapInGroup: overrides.components?.button?.gapInGroup ?? defaultSpacingExtension.components.button.gapInGroup
      },
      input: {
        padding: {
          ...defaultSpacingExtension.components.input.padding,
          ...overrides.components?.input?.padding
        },
        gap: overrides.components?.input?.gap ?? defaultSpacingExtension.components.input.gap,
        gapWithLabel: overrides.components?.input?.gapWithLabel ?? defaultSpacingExtension.components.input.gapWithLabel,
        gapWithError: overrides.components?.input?.gapWithError ?? defaultSpacingExtension.components.input.gapWithError
      },
      card: {
        padding: overrides.components?.card?.padding ?? defaultSpacingExtension.components.card.padding,
        gap: overrides.components?.card?.gap ?? defaultSpacingExtension.components.card.gap,
        headerPadding: overrides.components?.card?.headerPadding ?? defaultSpacingExtension.components.card.headerPadding,
        contentPadding: overrides.components?.card?.contentPadding ?? defaultSpacingExtension.components.card.contentPadding,
        footerPadding: overrides.components?.card?.footerPadding ?? defaultSpacingExtension.components.card.footerPadding
      },
      dialog: {
        padding: overrides.components?.dialog?.padding ?? defaultSpacingExtension.components.dialog.padding,
        gap: overrides.components?.dialog?.gap ?? defaultSpacingExtension.components.dialog.gap,
        titleMarginBottom: overrides.components?.dialog?.titleMarginBottom ?? defaultSpacingExtension.components.dialog.titleMarginBottom,
        contentMarginBottom: overrides.components?.dialog?.contentMarginBottom ?? defaultSpacingExtension.components.dialog.contentMarginBottom,
        buttonGap: overrides.components?.dialog?.buttonGap ?? defaultSpacingExtension.components.dialog.buttonGap,
        overlayPadding: overrides.components?.dialog?.overlayPadding ?? defaultSpacingExtension.components.dialog.overlayPadding
      },
      navigation: {
        itemPadding: overrides.components?.navigation?.itemPadding ?? defaultSpacingExtension.components.navigation.itemPadding,
        itemGap: overrides.components?.navigation?.itemGap ?? defaultSpacingExtension.components.navigation.itemGap,
        sectionGap: overrides.components?.navigation?.sectionGap ?? defaultSpacingExtension.components.navigation.sectionGap,
        logoPadding: overrides.components?.navigation?.logoPadding ?? defaultSpacingExtension.components.navigation.logoPadding,
        mobilePadding: overrides.components?.navigation?.mobilePadding ?? defaultSpacingExtension.components.navigation.mobilePadding
      },
      layout: {
        containerPadding: overrides.components?.layout?.containerPadding ?? defaultSpacingExtension.components.layout.containerPadding,
        sectionPadding: overrides.components?.layout?.sectionPadding ?? defaultSpacingExtension.components.layout.sectionPadding,
        gridGap: overrides.components?.layout?.gridGap ?? defaultSpacingExtension.components.layout.gridGap,
        stackGap: overrides.components?.layout?.stackGap ?? defaultSpacingExtension.components.layout.stackGap,
        formFieldGap: overrides.components?.layout?.formFieldGap ?? defaultSpacingExtension.components.layout.formFieldGap
      }
    }
  };
};