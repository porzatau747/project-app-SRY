export function buildFacebookCaption(input: {
  headline: string;
  subheadline: string;
  priceText: string;
  bodyCopy: string;
  cta: string;
  disclaimer: string;
}) {
  return `${input.headline}
${input.subheadline}
${input.priceText}

${input.bodyCopy}

${input.cta}

${input.disclaimer}`;
}

