import type { CSSProperties, JSX } from "react";

import { faFacebookF, faInstagram, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import {
  faArrowDown,
  faArrowRight,
  faArrowUp,
  faArrowsRotate,
  faBan,
  faBookOpen,
  faBug,
  faCalendarDays,
  faCamera,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircleExclamation,
  faClockRotateLeft,
  faComments,
  faCompass,
  faEye,
  faFlag,
  faGear,
  faHouse,
  faImage,
  faMoon,
  faPenToSquare,
  faPlus,
  faRightFromBracket,
  faShieldHalved,
  faStar,
  faSun,
  faTableColumns,
  faThumbsUp,
  faTrash,
  faUpload,
  faUser,
  faUsers,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface AppIconProps {
  readonly size?: number | string;
  readonly color?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly stroke?: number | string;
}

export type IconComponent = (props: Readonly<AppIconProps>) => JSX.Element;

function createIcon(icon: Parameters<typeof FontAwesomeIcon>[0]["icon"]): IconComponent {
  return function AppIcon({ size = 16, color, className, style }: Readonly<AppIconProps>) {
    return (
      <FontAwesomeIcon
        icon={icon}
        color={color}
        className={className}
        style={{ fontSize: typeof size === "number" ? `${size}px` : size, ...style }}
      />
    );
  };
}

export const IconAlertCircle = createIcon(faCircleExclamation);
export const IconArrowDown = createIcon(faArrowDown);
export const IconArrowRight = createIcon(faArrowRight);
export const IconArrowUp = createIcon(faArrowUp);
export const IconBan = createIcon(faBan);
export const IconBook = createIcon(faBookOpen);
export const IconBrandFacebook = createIcon(faFacebookF);
export const IconBrandInstagram = createIcon(faInstagram);
export const IconBrandTwitter = createIcon(faXTwitter);
export const IconBug = createIcon(faBug);
export const IconCalendar = createIcon(faCalendarDays);
export const IconCamera = createIcon(faCamera);
export const IconCheck = createIcon(faCheck);
export const IconChevronDown = createIcon(faChevronDown);
export const IconChevronLeft = createIcon(faChevronLeft);
export const IconChevronRight = createIcon(faChevronRight);
export const IconCompass = createIcon(faCompass);
export const IconEdit = createIcon(faPenToSquare);
export const IconEye = createIcon(faEye);
export const IconFlag = createIcon(faFlag);
export const IconHistory = createIcon(faClockRotateLeft);
export const IconHome = createIcon(faHouse);
export const IconLayoutDashboard = createIcon(faTableColumns);
export const IconLogout = createIcon(faRightFromBracket);
export const IconMessageCircle = createIcon(faComments);
export const IconMessageCircleExclamation = createIcon(faCircleExclamation);
export const IconMoon = createIcon(faMoon);
export const IconPhoto = createIcon(faImage);
export const IconPlus = createIcon(faPlus);
export const IconRefresh = createIcon(faArrowsRotate);
export const IconSearch = createIcon(faMagnifyingGlass);
export const IconSettings = createIcon(faGear);
export const IconShield = createIcon(faShieldHalved);
export const IconSparkles = createIcon(faStar);
export const IconStar = createIcon(faStar);
export const IconSun = createIcon(faSun);
export const IconSunrise = createIcon(faSun);
export const IconThumbUp = createIcon(faThumbsUp);
export const IconTrash = createIcon(faTrash);
export const IconUpload = createIcon(faUpload);
export const IconUser = createIcon(faUser);
export const IconUsers = createIcon(faUsers);
