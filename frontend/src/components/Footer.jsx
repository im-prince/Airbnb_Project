import { Link } from 'react-router-dom'

const columns = [
  {
    heading: 'Explore',
    links: [
      { label: 'Search stays', to: '/search' },
      { label: 'Popular cities', to: '/' },
      { label: 'Become a host', to: '/manager' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Log in', to: '/login' },
      { label: 'Sign up', to: '/signup' },
      { label: 'My trips', to: '/trips' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help centre', to: '/' },
      { label: 'Cancellation policy', to: '/' },
      { label: 'Contact us', to: '/' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="flex flex-wrap gap-12">
          <div className="min-w-[200px] flex-1">
            <div className="text-[19px] font-extrabold tracking-tight text-[var(--brand)]">
              nestay<span className="text-[var(--accent)]">.</span>
            </div>
            <p className="mt-3 max-w-[260px] text-sm text-[var(--muted)]">
              Verified stays across India. Honest prices, no surprises at checkout.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.heading} className="min-w-[140px]">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                {column.heading}
              </h3>
              <ul className="m-0 list-none p-0">
                {column.links.map((link) => (
                  <li key={link.label} className="mb-2">
                    <Link
                      to={link.to}
                      className="text-sm text-[var(--ink-2)] no-underline hover:text-[var(--brand)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[var(--line)] pt-6 text-sm text-[var(--muted)]">
          © {new Date().getFullYear()} Nestay. Built by Prince Kumar.
        </div>
      </div>
    </footer>
  )
}