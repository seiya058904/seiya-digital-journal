import avatar01 from '../assets/profile-avatars/avatar-01.jpg'
import avatar02 from '../assets/profile-avatars/avatar-02.jpg'
import avatar03 from '../assets/profile-avatars/avatar-03.jpg'
import avatar04 from '../assets/profile-avatars/avatar-04.jpg'
import avatar05 from '../assets/profile-avatars/avatar-05.jpg'
import avatar06 from '../assets/profile-avatars/avatar-06.jpg'
import avatar07 from '../assets/profile-avatars/avatar-07.jpg'
import avatar08 from '../assets/profile-avatars/avatar-08.jpg'
import avatar09 from '../assets/profile-avatars/avatar-09.jpg'
import avatar10 from '../assets/profile-avatars/avatar-10.jpg'
import avatar11 from '../assets/profile-avatars/avatar-11.jpg'
import avatar12 from '../assets/profile-avatars/avatar-12.jpg'
import {
  DEFAULT_PROFILE_AVATAR_KEY,
  PROFILE_AVATAR_KEYS,
  type ProfileAvatarKey,
} from '../lib/profile'

type ProfileAvatar = {
  key: ProfileAvatarKey
  src: string
  label: string
}

const profileAvatarMap: Record<ProfileAvatarKey, ProfileAvatar> = {
  'avatar-01': { key: 'avatar-01', src: avatar01, label: 'Preset avatar 01' },
  'avatar-02': { key: 'avatar-02', src: avatar02, label: 'Preset avatar 02' },
  'avatar-03': { key: 'avatar-03', src: avatar03, label: 'Preset avatar 03' },
  'avatar-04': { key: 'avatar-04', src: avatar04, label: 'Preset avatar 04' },
  'avatar-05': { key: 'avatar-05', src: avatar05, label: 'Preset avatar 05' },
  'avatar-06': { key: 'avatar-06', src: avatar06, label: 'Preset avatar 06' },
  'avatar-07': { key: 'avatar-07', src: avatar07, label: 'Preset avatar 07' },
  'avatar-08': { key: 'avatar-08', src: avatar08, label: 'Preset avatar 08' },
  'avatar-09': { key: 'avatar-09', src: avatar09, label: 'Preset avatar 09' },
  'avatar-10': { key: 'avatar-10', src: avatar10, label: 'Preset avatar 10' },
  'avatar-11': { key: 'avatar-11', src: avatar11, label: 'Preset avatar 11' },
  'avatar-12': { key: 'avatar-12', src: avatar12, label: 'Preset avatar 12' },
}

export const PROFILE_AVATAR_OPTIONS = PROFILE_AVATAR_KEYS.map((key) => profileAvatarMap[key])

export function getProfileAvatar(key: string): ProfileAvatar {
  if (key in profileAvatarMap) {
    return profileAvatarMap[key as ProfileAvatarKey]
  }
  return profileAvatarMap[DEFAULT_PROFILE_AVATAR_KEY]
}
