export const SITE = {
  website: "https://lamper.top/",
  author: "芯笑",
  profile: "https://github.com/hewenkkkkk",
  desc: "你若相逢 • 便是有缘",
  title: "Welcome",
  ogImage: "devosfera-og.webp", // ubicado en la carpeta public
  lightAndDarkMode: true,
  postPerIndex: 6,
  postPerPage: 9,
  timePerPage: 9, // 片刻分页
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showGalleries: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Editar este post",
    url: "https://github.com/0xdres/astro-devosfera/edit/main/",
  },
  dynamicOgImage: true,
  authorImage: "https://picui.ogmua.cn/s1/2026/03/04/69a8431b03cc1.webp",
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Shanghai", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  introAudio: {
    enabled: true, // 在首页 Hero 区域显示 / 隐藏播放器
    src: "/audio/bird.mp3", // 音频文件路径（相对于 /public 目录）
    label: "Flight of the Inner Bird", // 播放器中显示的标签名称
    duration: 330, // 音频时长（单位：秒，用于固定进度条显示）
  },
} as const;
