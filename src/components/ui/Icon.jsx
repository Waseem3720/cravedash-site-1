/**
 * Inline SVG icon set. Every path is taken from the original site markup so the
 * React version keeps the exact same look.
 */
const ICONS = {
  phone: {
    viewBox: '0 0 24 24',
    attrs: {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    content: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
    )
  },
  mail: {
    viewBox: '0 0 24 24',
    attrs: {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    content: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m2 7 10 6 10-6" />
      </>
    )
  },
  truck: {
    viewBox: '0 0 24 24',
    attrs: {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    content: (
      <>
        <path d="M1 3h13v13H1z" />
        <path d="M14 8h4l3 3v5h-7z" />
        <circle cx="5.5" cy="18.5" r="2" />
        <circle cx="17.5" cy="18.5" r="2" />
      </>
    )
  },
  cart: {
    viewBox: '0 0 24 24',
    attrs: {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    content: (
      <>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    )
  },
  basket: {
    viewBox: '0 0 24 24',
    attrs: {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.9,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    content: (
      <>
        <path d="M6 7h15l-1.4 8.2a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L5.2 3.5H3" />
        <circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
      </>
    )
  },
  close: {
    viewBox: '0 0 24 24',
    attrs: { fill: 'none', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round' },
    content: <path d="M18 6 6 18M6 6l12 12" />
  },
  heart: {
    viewBox: '0 0 24 24',
    attrs: {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.8,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    content: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    )
  },
  list: {
    viewBox: '0 0 20 20',
    attrs: { fill: 'currentColor' },
    content: <path d="M3 4h14v2H3V4Zm0 5h14v2H3V9Zm0 5h14v2H3v-2Z" />
  },
  grill: {
    viewBox: '0 0 20 20',
    attrs: { fill: 'currentColor' },
    content: <path d="M4 4h1.5v12H4V4Zm5 0h1.5v12H9V4Zm5 0h1.5v12H14V4ZM2 8h16v1.5H2V8Zm0 4h16v1.5H2V12Z" />
  },
  search: {
    viewBox: '0 0 20 20',
    attrs: { fill: 'currentColor' },
    content: (
      <path d="M8.5 2a6.5 6.5 0 1 0 4.1 11.5l3.4 3.5 1.1-1.1-3.5-3.4A6.5 6.5 0 0 0 8.5 2Zm0 1.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
    )
  },
  chevron: {
    viewBox: '0 0 24 24',
    attrs: { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' },
    content: <path d="m9 6 6 6-6 6" />
  },
  chevronLeft: {
    viewBox: '0 0 24 24',
    attrs: { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' },
    content: <path d="m15 6-6 6 6 6" />
  },
  info: {
    viewBox: '0 0 24 24',
    attrs: {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    content: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </>
    )
  },
  arrowUp: {
    viewBox: '0 0 24 24',
    attrs: {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2.4,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    content: (
      <>
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </>
    )
  },
  shield: {
    viewBox: '0 0 20 20',
    attrs: { fill: 'currentColor', width: 17, height: 17 },
    content: <path d="M10 1 3 4v6c0 4.2 2.9 8.1 7 9 4.1-.9 7-4.8 7-9V4l-7-3Zm0 8.9h5.5c-.4 3.2-2.5 6.1-5.5 7V9.9H4.5V5.3L10 2.9v7Z" />
  },
  clock: {
    viewBox: '0 0 20 20',
    attrs: { fill: 'currentColor', width: 17, height: 17 },
    content: <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.9 8.4-3.6 2.2-.8-1.3 2.9-1.7V5h1.5v5.4Z" />
  },
  note: {
    viewBox: '0 0 20 20',
    attrs: { fill: 'currentColor', width: 17, height: 17 },
    content: <path d="M4 3h12v2H4V3Zm0 4h12v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7Zm3 3v2h6v-2H7Z" />
  },
  instagram: {
    viewBox: '0 0 24 24',
    attrs: { fill: 'currentColor', width: 16, height: 16 },
    content: (
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5zm4.75-3.25a.75.75 0 1 1-.75.75.75.75 0 0 1 .75-.75z" />
    )
  },
  facebook: {
    viewBox: '0 0 24 24',
    attrs: { fill: 'currentColor', width: 16, height: 16 },
    content: (
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
    )
  },
  home: {
    viewBox: '0 0 24 24',
    attrs: {
      fill: 'currentColor',
      stroke: 'currentColor',
      strokeWidth: 1.9,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    content: (
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V20h13V9.5" fill="currentColor" />
      </>
    )
  },
  menuLines: {
    viewBox: '0 0 24 24',
    attrs: {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.9,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    content: <path d="M4 7h16M4 12h16M4 17h10" />
  },
  profile: {
    viewBox: '0 0 24 24',
    attrs: {
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.9,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
    content: (
      <>
        <circle cx="12" cy="8" r="3.5" fill="none" />
        <path d="M5 20c1.6-3.4 4-5 7-5s5.4 1.6 7 5" />
      </>
    )
  },
  bag: {
    viewBox: '0 0 20 20',
    attrs: { fill: 'currentColor' },
    content: <path d="M10 2a4 4 0 0 1 4 4H6a4 4 0 0 1 4-4ZM4 8h12l-1.6 9.2a1 1 0 0 1-1 .8H6.6a1 1 0 0 1-1-.8L4 8Z" />
  },
  star: {
    viewBox: '0 0 20 20',
    attrs: { fill: 'currentColor' },
    content: <path d="m10 2 2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.3l5-.7L10 2Z" />
  },
  apple: {
    viewBox: '0 0 24 24',
    attrs: { fill: 'currentColor' },
    content: (
      <path d="M16.4 12.8c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.2-2.8.8-3.6.8-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.4 1.2 0 1.6-.8 3.1-.8 1.4 0 1.8.8 3.1.7 1.3 0 2.1-1.1 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7 0 0-2.5-1-2.6-3.9zM14.1 5.6c.7-.8 1.1-1.9 1-3-1 0-2.2.6-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.5z" />
    )
  },
  google: {
    viewBox: '0 0 24 24',
    attrs: {},
    content: (
      <>
        <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" />
        <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
        <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9z" />
        <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.6 9.4 5.9 12 5.9z" />
      </>
    )
  }
}

export default function Icon({ name, size, className, ...rest }) {
  const icon = ICONS[name]
  if (!icon) return null
  const attrs = { ...icon.attrs }
  if (size) {
    attrs.width = size
    attrs.height = size
  }
  return (
    <svg
      viewBox={icon.viewBox}
      aria-hidden="true"
      focusable="false"
      className={className}
      {...attrs}
      {...rest}
    >
      {icon.content}
    </svg>
  )
}
