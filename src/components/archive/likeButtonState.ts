export type LikeSlotValues = [number | null, number | null]

export type LikeButtonModel = {
  count: number | null
  liked: boolean
  activeSlot: 0 | 1
  slotValues: LikeSlotValues
  hasAnimated: boolean
  liveMessage: string
  /**
   * Whether a like POST has been accepted. Once true, the initial count read
   * is invalidated (JR-04): a late response from it may hold a pre-like value
   * and must not clobber the accepted result. It deliberately stays false on
   * a failed POST so a still-pending trusted read can still populate the
   * button instead of leaving it in an unknown state forever.
   */
  hasAcceptedLike: boolean
}

export const ARCHIVE_LIKE_UNKNOWN_LABEL = 'Add a Like to the Archive'

export function createInitialLikeButtonModel(): LikeButtonModel {
  return {
    count: null,
    liked: false,
    activeSlot: 0,
    slotValues: [null, null],
    hasAnimated: false,
    liveMessage: '',
    hasAcceptedLike: false,
  }
}

export function beginLike(model: LikeButtonModel): LikeButtonModel {
  return { ...model, liked: true }
}

/** The initial count read settles; it loses to any already-accepted like. */
export function applyInitialCountRead(model: LikeButtonModel, value: number): LikeButtonModel {
  if (model.hasAcceptedLike) return model
  return { ...model, count: value, slotValues: [value, null] }
}

/** An accepted like: count, slots, aria source and live message move together. */
export function applyLikeSuccess(model: LikeButtonModel, count: number): LikeButtonModel {
  const nextSlot: 0 | 1 = model.activeSlot === 0 ? 1 : 0
  const slotValues = [...model.slotValues] as LikeSlotValues
  slotValues[nextSlot] = count
  return {
    ...model,
    count,
    liked: true,
    activeSlot: nextSlot,
    slotValues,
    hasAnimated: true,
    liveMessage: `Liked the archive. ${count} total likes.`,
    hasAcceptedLike: true,
  }
}

export function applyLikeFailure(model: LikeButtonModel, message: string): LikeButtonModel {
  return { ...model, liked: false, liveMessage: message }
}

export function deriveAriaLabel(model: LikeButtonModel): string {
  return model.count === null
    ? ARCHIVE_LIKE_UNKNOWN_LABEL
    : `${ARCHIVE_LIKE_UNKNOWN_LABEL} — ${model.count} likes`
}

export function deriveVisibleValue(model: LikeButtonModel): number | null {
  return model.slotValues[model.activeSlot]
}

export function slotClassName(model: LikeButtonModel, slot: 0 | 1): string {
  if (model.hasAnimated) {
    return model.activeSlot === slot
      ? 'archive-like__count-value--entering'
      : 'archive-like__count-value--leaving'
  }
  return model.activeSlot === slot
    ? 'archive-like__count-value--active'
    : 'archive-like__count-value--below'
}
