export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#FAFAFA] pt-32 pb-12 overflow-hidden px-6 lg:px-8 border-t border-gray-100 mt-24">
      {/* MASSIVE BACKGROUND WORDMARK */}
      <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center translate-y-1/3 md:translate-y-1/4 select-none pointer-events-none z-0">
        <span className="text-[16vw] font-black text-gray-900/[0.03] tracking-tight leading-none">
          StudentOS
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col gap-24 md:gap-32">
        {/* 4-COLUMN LINKS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 w-full">
          {/* Column 1 */}
          <div className="flex flex-col gap-6">
            <h4 className="text-[#111827] font-bold text-lg">Product</h4>
            <ul className="flex flex-col gap-4">
              {['Features', 'Integrations', 'Pricing', 'Changelog'].map((link) => (
                <li key={link}>
                  <a
                    href={`/${link.toLowerCase()}`}
                    className="text-gray-500 hover:text-[#4F46E5] transition-colors text-sm font-medium"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-6">
            <h4 className="text-[#111827] font-bold text-lg">Resources</h4>
            <ul className="flex flex-col gap-4">
              {['Documentation', 'API Reference', 'Community', 'Help Center'].map((link) => (
                <li key={link}>
                  <a
                    href={`#`}
                    className="text-gray-500 hover:text-[#4F46E5] transition-colors text-sm font-medium"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-6">
            <h4 className="text-[#111827] font-bold text-lg">Company</h4>
            <ul className="flex flex-col gap-4">
              {['About', 'Blog', 'Careers', 'Contact'].map((link) => (
                <li key={link}>
                  <a
                    href={`#`}
                    className="text-gray-500 hover:text-[#4F46E5] transition-colors text-sm font-medium"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-6">
            <h4 className="text-[#111827] font-bold text-lg">Legal</h4>
            <ul className="flex flex-col gap-4">
              {['Privacy', 'Terms', 'Security'].map((link) => (
                <li key={link}>
                  <a
                    href={`#`}
                    className="text-gray-500 hover:text-[#4F46E5] transition-colors text-sm font-medium"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR: Copyright & Socials */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-200/60 gap-6">
          <p className="text-sm font-medium text-gray-400 text-center md:text-left">
            © {currentYear} StudentOS Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {['Twitter', 'GitHub', 'Discord'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
