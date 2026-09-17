import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import ElderlyIcon from "@mui/icons-material/Elderly";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import GavelIcon from "@mui/icons-material/Gavel";
import GroupsIcon from "@mui/icons-material/Groups";
import HandshakeIcon from "@mui/icons-material/Handshake";
import HeadsetIcon from "@mui/icons-material/Headset";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import StorageIcon from "@mui/icons-material/Storage";
import TranslateIcon from "@mui/icons-material/Translate";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import WorkIcon from "@mui/icons-material/Work";
import type { SvgIconComponent } from "@mui/icons-material";

import type { IconKey } from "@/types/registration";

export const ICON_MAP: Record<IconKey, SvgIconComponent> = {
  gavel: GavelIcon,
  handshake: HandshakeIcon,
  chart: BarChartIcon,
  lightbulb: LightbulbIcon,
  search: SearchIcon,
  home: HomeWorkIcon,
  document: DescriptionIcon,
  bank: AccountBalanceIcon,
  laptop: LaptopMacIcon,
  people: GroupsIcon,
  person: PersonIcon,
  library: LibraryBooksIcon,
  work: WorkIcon,
  school: SchoolIcon,
  more: MoreHorizIcon,
  translate: TranslateIcon,
  folder: FolderCopyIcon,
  assignment: AssignmentIcon,
  volunteer: VolunteerActivismIcon,
  elderly: ElderlyIcon,
  shield: ShieldOutlinedIcon,
  storage: StorageIcon,
  settings: SettingsIcon,
  headset: HeadsetIcon,
};

export function resolveIcon(key?: IconKey): SvgIconComponent {
  return (key && ICON_MAP[key]) || DescriptionIcon;
}

export const RADIUS = { sm: "10px", md: "14px", lg: "16px" } as const;

export const SHADOW = {
  card: "0 1px 2px rgba(15,23,42,0.05), 0 6px 18px rgba(15,23,42,0.06)",
  cardHover: "0 8px 24px rgba(15,23,42,0.12)",
} as const;
