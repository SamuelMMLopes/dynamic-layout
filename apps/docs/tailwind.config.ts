import { type Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      backgroundImage: {
        square: 'url(https://portal.azure.com/Content/Static//MsPortalImpl/General/FlowLayout_gridShadow.png)',
      },
    },
  },
  plugins: [],
}
export default config
