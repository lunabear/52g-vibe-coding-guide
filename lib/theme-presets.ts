export const THEME_PRESETS = [
  {
    id: 'designSystem',
    name: '52g',
    description: '52g 브랜드 컬러',
    recommendation: '52g 브랜드 컬러로 신뢰감 있는 파란색이 정말 잘 어울려요',
    styleDescription: '52g 브랜드 공식 디자인 시스템',
    colorUsageRules: '- 브랜드 컬러: **{primaryHex}(파란색)** 메인 요소에 필수 사용\n- 포인트 컬러: **{accentHex}(오렌지)** 강조 요소에 사용',
    implementationGuideline: '신뢰감과 전문성을 중시하는 비즈니스 중심 디자인으로 구현하세요. 깔끔하고 직관적인 레이아웃을 사용하고, 버튼과 카드에는 적당한 라운드(rounded-lg)를 적용하세요. 호버 시 부드러운 트랜지션(transition-all duration-300)과 미묘한 그림자 변화를 통해 프로페셔널한 인터랙션을 만드세요. 타이포그래피는 가독성을 최우선으로 하되 적절한 위계를 두어 정보 구조를 명확히 하세요.',
    hexPalette: `:root {\n  --primary-100:#1493FF;\n  --primary-200:#58B2FF;\n  --primary-300:#BFE2FF;\n  --accent-100:#FF7A33;\n  --accent-200:#A3A3A3;\n  --text-100:#0B0B0B;\n  --text-200:#5D5D5D;\n  --bg-100:#F4F7FB;\n  --bg-200:#ECF2F9;\n  --bg-300:#DCE7F5;\n}`,
    css: `:root {\n  --background: 0 0% 100%;\n  --foreground: 0 0% 13%;\n  --card: 0 0% 100%;\n  --card-foreground: 0 0% 13%;\n  --popover: 0 0% 100%;\n  --popover-foreground: 0 0% 13%;\n  --primary: 205 96% 49%;\n  --primary-foreground: 0 0% 100%;\n  --secondary: 0 0% 96%;\n  --secondary-foreground: 0 0% 37%;\n  --muted: 0 0% 96%;\n  --muted-foreground: 0 0% 50%;\n  --accent: 18 100% 57%;\n  --accent-foreground: 0 0% 100%;\n  --destructive: 0 84% 60%;\n  --destructive-foreground: 0 0% 100%;\n  --border: 0 0% 85%;\n  --input: 0 0% 85%;\n  --ring: 205 96% 49%;\n  --chart-1: 205 96% 49%;\n  --chart-2: 18 100% 57%;\n  --chart-3: 150 60% 56%;\n  --chart-4: 52 100% 50%;\n  --chart-5: 180 100% 30%;\n  --sidebar: 0 0% 96%;\n  --sidebar-foreground: 0 0% 13%;\n  --sidebar-primary: 205 96% 49%;\n  --sidebar-primary-foreground: 0 0% 100%;\n  --sidebar-accent: 18 100% 57%;\n  --sidebar-accent-foreground: 0 0% 100%;\n  --sidebar-border: 0 0% 85%;\n  --sidebar-ring: 205 96% 49%;\n  --font-sans: Inter, sans-serif;\n  --font-serif: Source Serif 4, serif;\n  --font-mono: JetBrains Mono, monospace;\n  --radius: 0.375rem;\n  --shadow-2xs: 0px 1px 2px 0px hsl(0 0% 0% / 0.06);\n  --shadow-xs: 0px 1px 2px 0px hsl(0 0% 0% / 0.06);\n  --shadow-sm: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10);\n  --shadow: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10);\n  --shadow-md: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 2px 4px -2px hsl(0 0% 0% / 0.10);\n  --shadow-lg: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 4px 6px -2px hsl(0 0% 0% / 0.10);\n  --shadow-xl: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 8px 10px -2px hsl(0 0% 0% / 0.10);\n  --shadow-2xl: 0px 4px 8px -1px hsl(0 0% 0% / 0.25);\n  --tracking-normal: 0em;\n  --spacing: 0.25rem;\n}\n\n.dark {\n  --background: 0 0% 9%;\n  --foreground: 0 0% 90%;\n  --card: 0 0% 15%;\n  --card-foreground: 0 0% 90%;\n  --popover: 0 0% 15%;\n  --popover-foreground: 0 0% 90%;\n  --primary: 205 96% 60%;\n  --primary-foreground: 0 0% 0%;\n  --secondary: 0 0% 15%;\n  --secondary-foreground: 0 0% 90%;\n  --muted: 0 0% 15%;\n  --muted-foreground: 0 0% 65%;\n  --accent: 18 100% 47%;\n  --accent-foreground: 0 0% 100%;\n  --destructive: 0 84% 60%;\n  --destructive-foreground: 0 0% 0%;\n  --border: 0 0% 25%;\n  --input: 0 0% 25%;\n  --ring: 205 96% 60%;\n  --chart-1: 205 96% 56%;\n  --chart-2: 18 100% 50%;\n  --chart-3: 150 60% 50%;\n  --chart-4: 52 100% 56%;\n  --chart-5: 180 100% 35%;\n  --sidebar: 0 0% 6%;\n  --sidebar-foreground: 0 0% 90%;\n  --sidebar-primary: 205 96% 60%;\n  --sidebar-primary-foreground: 0 0% 0%;\n  --sidebar-accent: 18 100% 47%;\n  --sidebar-accent-foreground: 0 0% 100%;\n  --sidebar-border: 0 0% 25%;\n  --sidebar-ring: 205 96% 60%;\n}`
  },
  {
    id: 'modern-purple',
    name: 'MISO Purple',
    description: 'MISO 브랜드 컬러',
    recommendation: 'MISO 브랜드 컬러로 창의적이고 혁신적인 느낌을 주고 싶을 때 좋아요',
    styleDescription: '모던하고 창의적인 보라색 테마',
    colorUsageRules: '- 메인 요소: **반드시 {primaryHex}(보라색)** 사용\n- 호버 상태: **{primary200Hex}(연한 보라색)** 사용\n- 배경 강조: **{accentHex}(매우 연한 보라색)** 사용',
    implementationGuideline: '창의성과 혁신을 강조하는 모던한 디자인으로 구현하세요. 보라색의 신비롭고 크리에이티브한 느낌을 살려 그라데이션과 소프트한 그림자를 적극 활용하세요. 버튼과 카드는 둥근 모서리(rounded-xl)로 친근감을 주고, 호버 시 색상 변화와 약간의 스케일 효과로 인터랙티브한 경험을 제공하세요. 전체적으로 미래지향적이고 영감을 주는 분위기를 연출하세요.',
    hexPalette: `:root {\n  --primary-100:#5542F6;\n  --primary-200:#8B7CF6;\n  --primary-300:#D2D6FF;\n  --accent-100:#E6E9FF;\n  --accent-200:#A3A3A3;\n  --text-100:#111111;\n  --text-200:#5D5D5D;\n  --bg-100:#F7FAFF;\n  --bg-200:#F1F5FF;\n  --bg-300:#E6ECFF;\n}`,
    css: `:root {\n  --background: 0 0% 98%;\n  --foreground: 217.2414 32.5843% 17.4510%;\n  --card: 0 0% 100%;\n  --card-foreground: 217.2414 32.5843% 17.4510%;\n  --popover: 0 0% 100%;\n  --popover-foreground: 217.2414 32.5843% 17.4510%;\n  --primary: 248 87% 62%;\n  --primary-foreground: 0 0% 100%;\n  --secondary: 220 13.0435% 90.9804%;\n  --secondary-foreground: 216.9231 19.1176% 26.6667%;\n  --muted: 220.0000 14.2857% 95.8824%;\n  --muted-foreground: 220 8.9362% 46.0784%;\n  --accent: 248 20% 96%;\n  --accent-foreground: 216.9231 19.1176% 26.6667%;\n  --destructive: 0 84.2365% 60.1961%;\n  --destructive-foreground: 0 0% 100%;\n  --border: 216.0000 12.1951% 83.9216%;\n  --input: 216.0000 12.1951% 83.9216%;\n  --ring: 248 87% 62%;\n  --chart-1: 248 87% 62%;\n  --chart-2: 243.3962 75.3555% 58.6275%;\n  --chart-3: 244.5205 57.9365% 50.5882%;\n  --chart-4: 243.6522 54.5024% 41.3725%;\n  --chart-5: 242.1687 47.4286% 34.3137%;\n  --sidebar: 220.0000 14.2857% 95.8824%;\n  --sidebar-foreground: 217.2414 32.5843% 17.4510%;\n  --sidebar-primary: 248 87% 62%;\n  --sidebar-primary-foreground: 0 0% 100%;\n  --sidebar-accent: 226.4516 100% 93.9216%;\n  --sidebar-accent-foreground: 216.9231 19.1176% 26.6667%;\n  --sidebar-border: 216.0000 12.1951% 83.9216%;\n  --sidebar-ring: 248 87% 62%;\n  --font-sans: Inter, sans-serif;\n  --font-serif: Merriweather, serif;\n  --font-mono: JetBrains Mono, monospace;\n  --radius: 0.5rem;\n  --shadow-2xs: 0px 4px 8px -1px hsl(0 0% 0% / 0.05);\n  --shadow-xs: 0px 4px 8px -1px hsl(0 0% 0% / 0.05);\n  --shadow-sm: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10);\n  --shadow: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10);\n  --shadow-md: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 2px 4px -2px hsl(0 0% 0% / 0.10);\n  --shadow-lg: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 4px 6px -2px hsl(0 0% 0% / 0.10);\n  --shadow-xl: 0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 8px 10px -2px hsl(0 0% 0% / 0.10);\n  --shadow-2xl: 0px 4px 8px -1px hsl(0 0% 0% / 0.25);\n  --tracking-normal: 0em;\n  --spacing: 0.25rem;\n}\n\n.dark {\n  --background: 222.2222 47.3684% 11.1765%;\n  --foreground: 214.2857 31.8182% 91.3725%;\n  --card: 217.2414 32.5843% 17.4510%;\n  --card-foreground: 214.2857 31.8182% 91.3725%;\n  --popover: 217.2414 32.5843% 17.4510%;\n  --popover-foreground: 214.2857 31.8182% 91.3725%;\n  --primary: 234.4538 89.4737% 73.9216%;\n  --primary-foreground: 222.2222 47.3684% 11.1765%;\n  --secondary: 217.7778 23.0769% 22.9412%;\n  --secondary-foreground: 216.0000 12.1951% 83.9216%;\n  --muted: 217.2414 32.5843% 17.4510%;\n  --muted-foreground: 217.8947 10.6145% 64.9020%;\n  --accent: 216.9231 19.1176% 26.6667%;\n  --accent-foreground: 216.0000 12.1951% 83.9216%;\n  --destructive: 0 84.2365% 60.1961%;\n  --destructive-foreground: 222.2222 47.3684% 11.1765%;\n  --border: 215 13.7931% 34.1176%;\n  --input: 215 13.7931% 34.1176%;\n  --ring: 234.4538 89.4737% 73.9216%;\n  --chart-1: 234.4538 89.4737% 73.9216%;\n  --chart-2: 238.7324 83.5294% 66.6667%;\n  --chart-3: 243.3962 75.3555% 58.6275%;\n  --chart-4: 244.5205 57.9365% 50.5882%;\n  --chart-5: 243.6522 54.5024% 41.3725%;\n  --sidebar: 217.2414 32.5843% 17.4510%;\n  --sidebar-foreground: 214.2857 31.8182% 91.3725%;\n  --sidebar-primary: 234.4538 89.4737% 73.9216%;\n  --sidebar-primary-foreground: 222.2222 47.3684% 11.1765%;\n  --sidebar-accent: 216.9231 19.1176% 26.6667%;\n  --sidebar-accent-foreground: 216.0000 12.1951% 83.9216%;\n  --sidebar-border: 215 13.7931% 34.1176%;\n  --sidebar-ring: 234.4538 89.4737% 73.9216%;\n}`
  },
  {
    id: 'professional',
    name: 'Clear Blue',
    description: '전문적인 블루 테마',
    recommendation: '비즈니스 프레젠테이션에 완벽한 선택이에요',
    styleDescription: '신뢰감 있는 전문적인 블루 테마',
    colorUsageRules: '- 메인 요소: **{primaryHex}(파란색)** 일관 사용\n- 호버/액티브: **{primary200Hex}(연한 파란색)** 사용\n- 배경 구분: **{accentHex}(매우 연한 파란색)** 사용',
    implementationGuideline: '안정감과 신뢰성을 전달하는 전문적인 디자인으로 구현하세요. 명확한 구조와 일관된 패딩/마진을 사용해 정돈된 느낌을 주고, 버튼은 적당한 라운드(rounded-lg)와 견고한 그림자로 클릭 가능함을 명확히 표현하세요. 호버 상태에서는 색상 변화보다는 그림자 강화로 안정적인 피드백을 제공하고, 전체적으로 기업용 소프트웨어의 신뢰감 있는 분위기를 연출하세요.',
    hexPalette: `:root {\n  --primary-100:#2AA8FF;\n  --primary-200:#74C8FF;\n  --primary-300:#C8E9FF;\n  --accent-100:#E8F1FA;\n  --accent-200:#A3A3A3;\n  --text-100:#0B0B0B;\n  --text-200:#5D5D5D;\n  --bg-100:#F5FAFE;\n  --bg-200:#EDF5FB;\n  --bg-300:#E3EFF8;\n}`,
    css: `:root {\n  --background: 0 0% 100%;\n  --foreground: 210 25% 7.8431%;\n  --card: 180 6.6667% 97.0588%;\n  --card-foreground: 210 25% 7.8431%;\n  --popover: 0 0% 100%;\n  --popover-foreground: 210 25% 7.8431%;\n  --primary: 203.8863 88.2845% 53.1373%;\n  --primary-foreground: 0 0% 100%;\n  --secondary: 210 25% 7.8431%;\n  --secondary-foreground: 0 0% 100%;\n  --muted: 240 1.9608% 90%;\n  --muted-foreground: 210 25% 7.8431%;\n  --accent: 211.5789 51.3514% 92.7451%;\n  --accent-foreground: 203.8863 88.2845% 53.1373%;\n  --destructive: 356.3033 90.5579% 54.3137%;\n  --destructive-foreground: 0 0% 100%;\n  --border: 201.4286 30.4348% 90.9804%;\n  --input: 200 23.0769% 97.4510%;\n  --ring: 202.8169 89.1213% 53.1373%;\n  --chart-1: 203.8863 88.2845% 53.1373%;\n  --chart-2: 159.7826 100% 36.0784%;\n  --chart-3: 42.0290 92.8251% 56.2745%;\n  --chart-4: 147.1429 78.5047% 41.9608%;\n  --chart-5: 341.4894 75.2000% 50.9804%;\n  --sidebar: 180 6.6667% 97.0588%;\n  --sidebar-foreground: 210 25% 7.8431%;\n  --sidebar-primary: 203.8863 88.2845% 53.1373%;\n  --sidebar-primary-foreground: 0 0% 100%;\n  --sidebar-accent: 211.5789 51.3514% 92.7451%;\n  --sidebar-accent-foreground: 203.8863 88.2845% 53.1373%;\n  --sidebar-border: 205.0000 25.0000% 90.5882%;\n  --sidebar-ring: 202.8169 89.1213% 53.1373%;\n  --font-sans: Open Sans, sans-serif;\n  --font-serif: Georgia, serif;\n  --font-mono: Menlo, monospace;\n  --radius: 1.3rem;\n  --shadow-2xs: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow-xs: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow-sm: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 1px 2px -1px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 1px 2px -1px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow-md: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 2px 4px -1px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow-lg: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 4px 6px -1px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow-xl: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 8px 10px -1px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow-2xl: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --tracking-normal: 0em;\n  --spacing: 0.25rem;\n}\n\n.dark {\n  --background: 0 0% 0%;\n  --foreground: 200 6.6667% 91.1765%;\n  --card: 228 9.8039% 10%;\n  --card-foreground: 0 0% 85.0980%;\n  --popover: 0 0% 0%;\n  --popover-foreground: 200 6.6667% 91.1765%;\n  --primary: 203.7736 87.6033% 52.5490%;\n  --primary-foreground: 0 0% 100%;\n  --secondary: 195.0000 15.3846% 94.9020%;\n  --secondary-foreground: 210 25% 7.8431%;\n  --muted: 0 0% 9.4118%;\n  --muted-foreground: 210 3.3898% 46.2745%;\n  --accent: 205.7143 70% 7.8431%;\n  --accent-foreground: 203.7736 87.6033% 52.5490%;\n  --destructive: 356.3033 90.5579% 54.3137%;\n  --destructive-foreground: 0 0% 100%;\n  --border: 210 5.2632% 14.9020%;\n  --input: 207.6923 27.6596% 18.4314%;\n  --ring: 202.8169 89.1213% 53.1373%;\n  --chart-1: 203.8863 88.2845% 53.1373%;\n  --chart-2: 159.7826 100% 36.0784%;\n  --chart-3: 42.0290 92.8251% 56.2745%;\n  --chart-4: 147.1429 78.5047% 41.9608%;\n  --chart-5: 341.4894 75.2000% 50.9804%;\n  --sidebar: 228 9.8039% 10%;\n  --sidebar-foreground: 0 0% 85.0980%;\n  --sidebar-primary: 202.8169 89.1213% 53.1373%;\n  --sidebar-primary-foreground: 0 0% 100%;\n  --sidebar-accent: 205.7143 70% 7.8431%;\n  --sidebar-accent-foreground: 203.7736 87.6033% 52.5490%;\n  --sidebar-border: 205.7143 15.7895% 26.0784%;\n  --sidebar-ring: 202.8169 89.1213% 53.1373%;\n  --font-sans: Open Sans, sans-serif;\n  --font-serif: Georgia, serif;\n  --font-mono: Menlo, monospace;\n  --radius: 1.3rem;\n  --shadow-2xs: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow-xs: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow-sm: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 1px 2px -1px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 1px 2px -1px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow-md: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 2px 4px -1px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow-lg: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 4px 6px -1px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow-xl: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00), 0px 8px 10px -1px hsl(202.8169 89.1213% 53.1373% / 0.00);\n  --shadow-2xl: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00);\n}`
  },
  {
    id: 'chic-black',
    name: 'Chic Black',
    description: '깔끔한 블랙 테마',
    recommendation: '깔끔하고 세련된 미니멀 디자인을 원하시는 분께 추천해요',
    styleDescription: '미니멀하고 세련된 블랙 테마',
    colorUsageRules: '- 메인 버튼: **{primaryHex}(검정색) 배경, 흰색 텍스트**\n- 아웃라인 버튼: **투명 배경, {primaryHex}(검정색) 테두리와 텍스트**\n- 강조 색상: **{accentHex}(파란색)** 포인트 사용',
    implementationGuideline: '미니멀리즘의 철학을 따라 불필요한 요소를 최대한 제거하고 구현하세요. 검정색과 흰색의 강한 대비를 활용해 명확한 위계를 만들고, 여백을 넉넉히 두어 세련된 느낌을 연출하세요. 그림자는 최소한으로 사용하고, 호버 시에는 미묘한 색상 변화나 투명도 조절로 고급스러운 인터랙션을 제공하세요. 타이포그래피는 깔끔하고 읽기 쉽게, 전체적으로 스칸디나비아 디자인의 절제미를 표현하세요.',
    hexPalette: `:root {\n  --primary-100:#000000;\n  --primary-200:#222222;\n  --primary-300:#555555;\n  --accent-100:#3BA3FF;\n  --accent-200:#A3A3A3;\n  --text-100:#000000;\n  --text-200:#CCCCCC;\n  --bg-100:#FAFAFA;\n  --bg-200:#F2F2F2;\n  --bg-300:#E6E6E6;\n}`,
    css: `:root {\n  --background: 0 0% 100%;\n  --foreground: 0 0% 0%;\n  --card: 0 0% 100%;\n  --card-foreground: 0 0% 0%;\n  --popover: 0 0% 100%;\n  --popover-foreground: 0 0% 0%;\n  --primary: 0 0% 0%;\n  --primary-foreground: 0 0% 100%;\n  --secondary: 0 0% 92%;\n  --secondary-foreground: 0 0% 0%;\n  --muted: 0 0% 96%;\n  --muted-foreground: 0 0% 32%;\n  --accent: 0 0% 92%;\n  --accent-foreground: 0 0% 0%;\n  --destructive: 358 75% 60%;\n  --destructive-foreground: 0 0% 100%;\n  --border: 0 0% 89%;\n  --input: 0 0% 92%;\n  --ring: 0 0% 0%;\n  --chart-1: 41 100% 51%;\n  --chart-2: 224 86% 56%;\n  --chart-3: 0 0% 64%;\n  --chart-4: 0 0% 90%;\n  --chart-5: 0 0% 46%;\n  --sidebar: 0 0% 98%;\n  --sidebar-foreground: 0 0% 0%;\n  --sidebar-primary: 0 0% 0%;\n  --sidebar-primary-foreground: 0 0% 100%;\n  --sidebar-accent: 0 0% 92%;\n  --sidebar-accent-foreground: 0 0% 0%;\n  --sidebar-border: 0 0% 92%;\n  --sidebar-ring: 0 0% 0%;\n  --font-sans: Geist, sans-serif;\n  --font-serif: Georgia, serif;\n  --font-mono: Geist Mono, monospace;\n  --radius: 0.5rem;\n  --shadow-2xs: 0px 1px 2px 0px hsl(0 0% 0% / 0.09);\n  --shadow-xs: 0px 1px 2px 0px hsl(0 0% 0% / 0.09);\n  --shadow-sm: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 1px 2px -1px hsl(0 0% 0% / 0.18);\n  --shadow: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 1px 2px -1px hsl(0 0% 0% / 0.18);\n  --shadow-md: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 2px 4px -1px hsl(0 0% 0% / 0.18);\n  --shadow-lg: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 4px 6px -1px hsl(0 0% 0% / 0.18);\n  --shadow-xl: 0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 8px 10px -1px hsl(0 0% 0% / 0.18);\n  --shadow-2xl: 0px 1px 2px 0px hsl(0 0% 0% / 0.45);\n  --tracking-normal: 0em;\n  --spacing: 0.25rem;\n}\n\n.dark {\n  --background: 0 0% 0%;\n  --foreground: 0 0% 100%;\n  --card: 0 0% 4%;\n  --card-foreground: 0 0% 100%;\n  --popover: 0 0% 7%;\n  --popover-foreground: 0 0% 100%;\n  --primary: 0 0% 100%;\n  --primary-foreground: 0 0% 0%;\n  --secondary: 0 0% 13%;\n  --secondary-foreground: 0 0% 100%;\n  --muted: 0 0% 11%;\n  --muted-foreground: 0 0% 64%;\n  --accent: 0 0% 20%;\n  --accent-foreground: 0 0% 100%;\n  --destructive: 360 100% 68%;\n  --destructive-foreground: 0 0% 0%;\n  --border: 0 0% 14%;\n  --input: 0 0% 20%;\n  --ring: 0 0% 64%;\n  --chart-1: 41 100% 51%;\n  --chart-2: 218 90% 55%;\n  --chart-3: 0 0% 46%;\n  --chart-4: 0 0% 32%;\n  --chart-5: 0 0% 90%;\n  --sidebar: 0 0% 7%;\n  --sidebar-foreground: 0 0% 100%;\n  --sidebar-primary: 0 0% 100%;\n  --sidebar-primary-foreground: 0 0% 0%;\n  --sidebar-accent: 0 0% 20%;\n  --sidebar-accent-foreground: 0 0% 100%;\n  --sidebar-border: 0 0% 20%;\n  --sidebar-ring: 0 0% 64%;\n}`
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    description: '자연스러운 그린 테마',
    recommendation: '자연스럽고 편안한 느낌을 주는 따뜻한 컬러에요',
    styleDescription: '자연 친화적이고 편안한 그린 테마',
    colorUsageRules: '- 메인 색상: **{primaryHex}(녹색)** 핵심 요소에 사용\n- 보조 색상: **{primary200Hex}(연한 녹색)** 배경이나 호버에 사용\n- 액센트: **{accentHex}(매우 연한 녹색)** 미묘한 강조',
    implementationGuideline: '자연스럽고 따뜻한 느낌의 친환경적 디자인으로 구현하세요. 유기적이고 부드러운 형태를 선호하며, 모서리는 적당히 둥글게(rounded-lg) 처리해 친근감을 주세요. 그라데이션을 자연스럽게 활용하고, 호버 시에는 자연의 성장을 연상시키는 부드러운 애니메이션(scale, opacity 변화)을 적용하세요. 전체적으로 지속가능성과 안정감을 전달하는 힐링 공간의 분위기를 만드세요.',
    hexPalette: `:root {\n  --primary-100:#2F7A50;\n  --primary-200:#66A885;\n  --primary-300:#C7E3D3;\n  --accent-100:#CCEAD7;\n  --accent-200:#A3A3A3;\n  --text-100:#0B0B0B;\n  --text-200:#4A5A53;\n  --bg-100:#F2F7F3;\n  --bg-200:#E8F1EC;\n  --bg-300:#DCEAE2;\n}`,
    css: `:root {\n  --background: 37.5000 36.3636% 95.6863%;\n  --foreground: 8.8889 27.8351% 19.0196%;\n  --card: 37.5000 36.3636% 95.6863%;\n  --card-foreground: 8.8889 27.8351% 19.0196%;\n  --popover: 37.5000 36.3636% 95.6863%;\n  --popover-foreground: 8.8889 27.8351% 19.0196%;\n  --primary: 123.0380 46.1988% 33.5294%;\n  --primary-foreground: 0 0% 100%;\n  --secondary: 124.6154 39.3939% 93.5294%;\n  --secondary-foreground: 124.4776 55.3719% 23.7255%;\n  --muted: 33.7500 34.7826% 90.9804%;\n  --muted-foreground: 15.0000 25.2874% 34.1176%;\n  --accent: 122 37.5000% 84.3137%;\n  --accent-foreground: 124.4776 55.3719% 23.7255%;\n  --destructive: 0 66.3866% 46.6667%;\n  --destructive-foreground: 0 0% 100%;\n  --border: 33.9130 27.0588% 83.3333%;\n  --input: 33.9130 27.0588% 83.3333%;\n  --ring: 123.0380 46.1988% 33.5294%;\n  --chart-1: 122.4242 39.4422% 49.2157%;\n  --chart-2: 122.7907 43.4343% 38.8235%;\n  --chart-3: 123.0380 46.1988% 33.5294%;\n  --chart-4: 124.4776 55.3719% 23.7255%;\n  --chart-5: 125.7143 51.2195% 8.0392%;\n  --sidebar: 33.7500 34.7826% 90.9804%;\n  --sidebar-foreground: 8.8889 27.8351% 19.0196%;\n  --sidebar-primary: 123.0380 46.1988% 33.5294%;\n  --sidebar-primary-foreground: 0 0% 100%;\n  --sidebar-accent: 122 37.5000% 84.3137%;\n  --sidebar-accent-foreground: 124.4776 55.3719% 23.7255%;\n  --sidebar-border: 33.9130 27.0588% 83.3333%;\n  --sidebar-ring: 123.0380 46.1988% 33.5294%;\n  --font-sans: Montserrat, sans-serif;\n  --font-serif: Merriweather, serif;\n  --font-mono: Source Code Pro, monospace;\n  --radius: 0.5rem;\n  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);\n  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);\n  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);\n  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);\n  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);\n  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);\n  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);\n  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);\n  --tracking-normal: 0em;\n  --spacing: 0.25rem;\n}\n\n.dark {\n  --background: 132.8571 20% 13.7255%;\n  --foreground: 32.7273 26.8293% 91.9608%;\n  --card: 124.6154 12.6214% 20.1961%;\n  --card-foreground: 32.7273 26.8293% 91.9608%;\n  --popover: 124.6154 12.6214% 20.1961%;\n  --popover-foreground: 32.7273 26.8293% 91.9608%;\n  --primary: 122.4242 39.4422% 49.2157%;\n  --primary-foreground: 125.7143 51.2195% 8.0392%;\n  --secondary: 115.3846 9.6296% 26.4706%;\n  --secondary-foreground: 114.0000 13.8889% 85.8824%;\n  --muted: 124.6154 12.6214% 20.1961%;\n  --muted-foreground: 34.7368 19.1919% 80.5882%;\n  --accent: 122.7907 43.4343% 38.8235%;\n  --accent-foreground: 32.7273 26.8293% 91.9608%;\n  --destructive: 0 66.3866% 46.6667%;\n  --destructive-foreground: 32.7273 26.8293% 91.9608%;\n  --border: 115.3846 9.6296% 26.4706%;\n  --input: 115.3846 9.6296% 26.4706%;\n  --ring: 122.4242 39.4422% 49.2157%;\n  --chart-1: 122.5714 38.4615% 64.3137%;\n  --chart-2: 122.8235 38.4615% 56.6667%;\n  --chart-3: 122.4242 39.4422% 49.2157%;\n  --chart-4: 122.5806 40.9692% 44.5098%;\n  --chart-5: 122.7907 43.4343% 38.8235%;\n  --sidebar: 132.8571 20% 13.7255%;\n  --sidebar-foreground: 32.7273 26.8293% 91.9608%;\n  --sidebar-primary: 122.4242 39.4422% 49.2157%;\n  --sidebar-primary-foreground: 125.7143 51.2195% 8.0392%;\n  --sidebar-accent: 122.7907 43.4343% 38.8235%;\n  --sidebar-accent-foreground: 32.7273 26.8293% 91.9608%;\n  --sidebar-border: 115.3846 9.6296% 26.4706%;\n  --sidebar-ring: 122.4242 39.4422% 49.2157%;\n  --font-sans: Montserrat, sans-serif;\n  --font-serif: Merriweather, serif;\n  --font-mono: Source Code Pro, monospace;\n  --radius: 0.5rem;\n  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);\n  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);\n  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);\n  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);\n  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);\n  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);\n  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);\n  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);\n}`
  },
  {
    id: 'bold-colors',
    name: 'Bold Colors',
    description: '대담한 컬러 조합 테마',
    recommendation: '강렬하고 개성 있는 브랜드 이미지를 원할 때 완벽해요',
    styleDescription: '브루탈리즘(Brutalism) 디자인 - 대담하고 강렬한 스타일',
    colorUsageRules: '- 메인 액션 버튼: **반드시 {primaryHex}(빨간색) 배경** 사용\n- 강조 요소: **{accentHex}(파란색)** 또는 **{primary200Hex}(노란색)** 사용\n- 모든 버튼에 **4px 검정 테두리**와 **오프셋 그림자** 적용',
    implementationGuideline: '브루탈리즘(Brutalism) 철학에 따라 강렬하고 대담한 디자인으로 구현하세요. 모든 인터랙티브 요소는 굵은 검정 테두리(border-4 border-black)와 오프셋 그림자(shadow-[4px_4px_0px_0px_#000])를 필수로 적용하세요. 원각은 사용하지 않고(rounded-none), 직각적이고 기하학적인 형태를 유지하세요. 색상은 최대한 채도를 높이고, 호버 시에는 그림자 위치 변화나 색상 반전 등 강렬한 인터랙션을 제공하세요. 전체적으로 반항적이고 개성 있는 언더그라운드 문화의 에너지를 표현하세요.',
    hexPalette: `:root {\n  --primary-100:#FF3B3B;\n  --primary-200:#FF7A7A;\n  --primary-300:#FFBDBD;\n  --accent-100:#1E90FF;\n  --accent-200:#FFD500;\n  --text-100:#0B0B0B;\n  --text-200:#4A4A4A;\n  --bg-100:#FFFFFF;\n  --bg-200:#F5F5F5;\n  --bg-300:#E9E9E9;\n}`,
    css: `:root {\n  --background: 0 0% 100%;\n  --foreground: 0 0% 0%;\n  --card: 0 0% 100%;\n  --card-foreground: 0 0% 0%;\n  --popover: 0 0% 100%;\n  --popover-foreground: 0 0% 0%;\n  --primary: 0 100% 60%;\n  --primary-foreground: 0 0% 100%;\n  --secondary: 60 100% 50%;\n  --secondary-foreground: 0 0% 0%;\n  --muted: 0 0% 94.1176%;\n  --muted-foreground: 0 0% 20%;\n  --accent: 216 100% 50%;\n  --accent-foreground: 0 0% 100%;\n  --destructive: 0 0% 0%;\n  --destructive-foreground: 0 0% 100%;\n  --border: 0 0% 0%;\n  --input: 0 0% 0%;\n  --ring: 0 100% 60%;\n  --chart-1: 0 100% 60%;\n  --chart-2: 60 100% 50%;\n  --chart-3: 216 100% 50%;\n  --chart-4: 120 100% 40%;\n  --chart-5: 300 100% 40%;\n  --sidebar: 0 0% 94.1176%;\n  --sidebar-foreground: 0 0% 0%;\n  --sidebar-primary: 0 100% 60%;\n  --sidebar-primary-foreground: 0 0% 100%;\n  --sidebar-accent: 216 100% 50%;\n  --sidebar-accent-foreground: 0 0% 100%;\n  --sidebar-border: 0 0% 0%;\n  --sidebar-ring: 0 100% 60%;\n  --font-sans: DM Sans, sans-serif;\n  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;\n  --font-mono: Space Mono, monospace;\n  --radius: 0px;\n  --shadow-2xs: 4px 4px 0px 0px hsl(0 0% 0% / 0.50);\n  --shadow-xs: 4px 4px 0px 0px hsl(0 0% 0% / 0.50);\n  --shadow-sm: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 1px 2px -1px hsl(0 0% 0% / 1.00);\n  --shadow: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 1px 2px -1px hsl(0 0% 0% / 1.00);\n  --shadow-md: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 2px 4px -1px hsl(0 0% 0% / 1.00);\n  --shadow-lg: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 4px 6px -1px hsl(0 0% 0% / 1.00);\n  --shadow-xl: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 8px 10px -1px hsl(0 0% 0% / 1.00);\n  --shadow-2xl: 4px 4px 0px 0px hsl(0 0% 0% / 2.50);\n  --tracking-normal: 0em;\n  --spacing: 0.25rem;\n}\n\n.dark {\n  --background: 0 0% 0%;\n  --foreground: 0 0% 100%;\n  --card: 0 0% 20%;\n  --card-foreground: 0 0% 100%;\n  --popover: 0 0% 20%;\n  --popover-foreground: 0 0% 100%;\n  --primary: 0 100.0000% 70%;\n  --primary-foreground: 0 0% 0%;\n  --secondary: 60 100% 60%;\n  --secondary-foreground: 0 0% 0%;\n  --muted: 0 0% 20%;\n  --muted-foreground: 0 0% 80%;\n  --accent: 210 100% 60%;\n  --accent-foreground: 0 0% 0%;\n  --destructive: 0 0% 100%;\n  --destructive-foreground: 0 0% 0%;\n  --border: 0 0% 100%;\n  --input: 0 0% 100%;\n  --ring: 0 100.0000% 70%;\n  --chart-1: 0 100.0000% 70%;\n  --chart-2: 60 100% 60%;\n  --chart-3: 210 100% 60%;\n  --chart-4: 120 60.0000% 50%;\n  --chart-5: 300 60.0000% 50%;\n  --sidebar: 0 0% 0%;\n  --sidebar-foreground: 0 0% 100%;\n  --sidebar-primary: 0 100.0000% 70%;\n  --sidebar-primary-foreground: 0 0% 0%;\n  --sidebar-accent: 210 100% 60%;\n  --sidebar-accent-foreground: 0 0% 0%;\n  --sidebar-border: 0 0% 100%;\n  --sidebar-ring: 0 100.0000% 70%;\n  --font-sans: DM Sans, sans-serif;\n  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;\n  --font-mono: Space Mono, monospace;\n  --radius: 0px;\n  --shadow-2xs: 4px 4px 0px 0px hsl(0 0% 0% / 0.50);\n  --shadow-xs: 4px 4px 0px 0px hsl(0 0% 0% / 0.50);\n  --shadow-sm: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 1px 2px -1px hsl(0 0% 0% / 1.00);\n  --shadow: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 1px 2px -1px hsl(0 0% 0% / 1.00);\n  --shadow-md: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 2px 4px -1px hsl(0 0% 0% / 1.00);\n  --shadow-lg: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 4px 6px -1px hsl(0 0% 0% / 1.00);\n  --shadow-xl: 4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 8px 10px -1px hsl(0 0% 0% / 1.00);\n  --shadow-2xl: 4px 4px 0px 0px hsl(0 0% 0% / 2.50);\n}`
  },
  {
    id: 'apple-liquid-glass',
    name: '글라스모피즘',
    description: '글라스모피즘 테마',
    recommendation: '정교한 글라스모피즘으로 최고급 UI 경험을 원할 때 완벽해요',
    styleDescription: '글라스모피즘 (Glassmorphism) - 정교한 투명도와 부드러운 블러 효과',
    colorUsageRules: '- 메인 요소: **{primaryHex}(소프트 블루)** 미묘한 투명도와 함께 사용\n- 글래스 효과: **정교한 backdrop-blur와 그라데이션** 필수 적용\n- 강조 요소: **{accentHex}(라벤더)** 우아한 포인트 컬러\n- 모든 요소에 **애플급 정밀한 유리 질감** 적용',
    implementationGuideline: '애플의 정교한 글라스모피즘 디자인 언어로 구현하세요. 모든 카드와 모달에는 backdrop-blur-xl과 bg-white/80 같은 투명도를 적용하고, 미묘한 그라데이션과 inner shadow로 유리 질감을 연출하세요. 버튼은 큰 라운드(rounded-2xl)와 부드러운 그림자로 플로팅 효과를 주고, 호버 시에는 투명도와 블러 강도를 조절해 깊이감을 표현하세요. 전체적으로 애플 제품의 프리미엄하고 우아한 감성을 담아 미래적이면서도 따뜻한 인터페이스를 만드세요.',
    hexPalette: `:root {
  --primary-100:#007AFF;
  --primary-200:#5AC8FA;
  --primary-300:#BFE7FF;
  --accent-100:#AF52DE;
  --accent-200:#D1C4E9;
  --text-100:#1D1D1F;
  --text-200:#6D6D70;
  --bg-100:#F9FAFB;
  --bg-200:#F3F4F6;
  --bg-300:#E5E7EB;
}`,
    css: `:root {
  --background: 220 14% 97.2549%;
  --foreground: 216 6.5% 11.7647%;
  --card: 220 14% 97.2549% / 0.85;
  --card-foreground: 216 6.5% 11.7647%;
  --popover: 220 14% 97.2549% / 0.95;
  --popover-foreground: 216 6.5% 11.7647%;
  --primary: 211 100% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 220 14% 97.2549% / 0.7;
  --secondary-foreground: 216 6.5% 11.7647%;
  --muted: 220 14% 95.2941% / 0.6;
  --muted-foreground: 220 9.0909% 42.7451%;
  --accent: 280 48.6842% 59.4118%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 220 13% 91.1765% / 0.4;
  --input: 220 13% 91.1765% / 0.5;
  --ring: 211 100% 50% / 0.6;
  --chart-1: 211 100% 50%;
  --chart-2: 280 48.6842% 59.4118%;
  --chart-3: 191.5789 100% 86.6667%;
  --chart-4: 280 48.6842% 82.5490%;
  --chart-5: 191.5789 100% 75.2941%;
  --sidebar: 220 14% 97.2549% / 0.8;
  --sidebar-foreground: 216 6.5% 11.7647%;
  --sidebar-primary: 211 100% 50%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 220 14% 97.2549% / 0.7;
  --sidebar-accent-foreground: 216 6.5% 11.7647%;
  --sidebar-border: 220 13% 91.1765% / 0.4;
  --sidebar-ring: 211 100% 50% / 0.6;
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif;
  --font-serif: "New York", "Times New Roman", Georgia, serif;
  --font-mono: "SF Mono", "Monaco", "Inconsolata", "Fira Code", Consolas, monospace;
  --radius: 0.875rem;
  --shadow-2xs: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  --shadow-xs: 0 1px 3px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 4px 8px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03);
  --shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.03);
  --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05);
  --shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.15);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --tracking-normal: -0.01em;
  --spacing: 0.25rem;
  --glass-primary: rgb(0 122 255 / 0.08);
  --glass-secondary: rgb(175 82 222 / 0.06);
  --glass-blur: blur(40px);
  --glass-border: rgb(255 255 255 / 0.18);
  --glass-shadow: 0 8px 32px rgb(0 0 0 / 0.08);
}

.dark {
  --background: 216 11% 7.8431%;
  --foreground: 216 6% 87.0588%;
  --card: 216 11% 7.8431% / 0.8;
  --card-foreground: 216 6% 87.0588%;
  --popover: 216 11% 7.8431% / 0.95;
  --popover-foreground: 216 6% 87.0588%;
  --primary: 211 100% 65%;
  --primary-foreground: 216 11% 7.8431%;
  --secondary: 216 11% 15.2941% / 0.7;
  --secondary-foreground: 216 6% 87.0588%;
  --muted: 216 11% 15.2941% / 0.5;
  --muted-foreground: 217 9.7% 64.7059%;
  --accent: 280 48.6842% 70%;
  --accent-foreground: 216 11% 7.8431%;
  --destructive: 0 84% 70%;
  --destructive-foreground: 216 11% 7.8431%;
  --border: 216 11% 20.3922% / 0.4;
  --input: 216 11% 20.3922% / 0.5;
  --ring: 211 100% 65% / 0.6;
  --chart-1: 211 100% 65%;
  --chart-2: 280 48.6842% 70%;
  --chart-3: 191.5789 100% 75%;
  --chart-4: 280 48.6842% 80%;
  --chart-5: 191.5789 100% 65%;
  --sidebar: 216 11% 7.8431% / 0.8;
  --sidebar-foreground: 216 6% 87.0588%;
  --sidebar-primary: 211 100% 65%;
  --sidebar-primary-foreground: 216 11% 7.8431%;
  --sidebar-accent: 216 11% 15.2941% / 0.7;
  --sidebar-accent-foreground: 216 6% 87.0588%;
  --sidebar-border: 216 11% 20.3922% / 0.4;
  --sidebar-ring: 211 100% 65% / 0.6;
  --glass-primary: rgb(0 122 255 / 0.12);
  --glass-secondary: rgb(175 82 222 / 0.08);
  --glass-blur: blur(45px);
  --glass-border: rgb(255 255 255 / 0.08);
  --glass-shadow: 0 8px 32px rgb(0 0 0 / 0.25);
}`
  }
] as const;

export type ThemePreset = (typeof THEME_PRESETS)[number];

export function buildTailwindThemeMarkdown(preset: ThemePreset): string {
  // Extract primary colors from hexPalette for direct reference
  const primaryHex = preset.hexPalette.match(/--primary-100:\s*([#\w]+);/)?.[1] || '#6F7DFF';
  const primary200Hex = preset.hexPalette.match(/--primary-200:\s*([#\w]+);/)?.[1] || '#9AA2FF';
  const accentHex = preset.hexPalette.match(/--accent-100:\s*([#\w]+);/)?.[1] || '#E6E9FF';
  const textHex = preset.hexPalette.match(/--text-100:\s*([#\w]+);/)?.[1] || '#111111';
  const bgHex = preset.hexPalette.match(/--bg-100:\s*([#\w]+);/)?.[1] || '#FFFFFF';
  
  // Use preset data and replace template variables
  const colorUsageRules = preset.colorUsageRules
    .replace(/{primaryHex}/g, primaryHex)
    .replace(/{primary200Hex}/g, primary200Hex)
    .replace(/{accentHex}/g, accentHex);

  const header = `# ${preset.name} 디자인 시스템\n\n` +
    `${preset.styleDescription}\n\n`;

  const colorSystem = `## 핵심 색상 코드\n\n` +
    `| 용도 | HEX 코드 |\n` +
    `|------|---------|\n` +
    `| **Primary (메인)** | ${primaryHex} |\n` +
    `| **Primary Light** | ${primary200Hex} |\n` +
    `| **Accent (강조)** | ${accentHex} |\n` +
    `| **Text** | ${textHex} |\n` +
    `| **Background** | ${bgHex} |\n\n` +
    `## 색상 사용 가이드라인\n\n` +
    colorUsageRules + `\n\n`;

  const implementationGuide = `## 구현 가이드라인\n\n${preset.implementationGuideline}\n\n`;

  return header + colorSystem + implementationGuide;
}