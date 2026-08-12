import type { Variants } from 'framer-motion'

export const earningsEase = [0.25, 0.1, 0.25, 1] as const

export const earningsPageLoadTransition = { duration: 0.4, ease: earningsEase }

export const earningsTopStaggerParentVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

export const earningsTopCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: earningsEase },
  },
}

export const earningsCardHoverTransition = { duration: 0.2, ease: 'easeOut' as const }

export const earningsCardLiftHover = {
  whileHover: { y: -4, transition: earningsCardHoverTransition },
}

export const earningsInfoBannerVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: earningsEase, delay: 0.05 },
  },
}

export const earningsTableSectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: earningsEase, delay: 0.06 },
  },
}

export const earningsTableStaggerParentVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
}

export const earningsTableRowVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: earningsEase },
  },
}

export const earningsBottomGridParentVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
}

export const earningsWithdrawSectionVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: earningsEase },
  },
}

export const earningsPaymentCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.38, ease: earningsEase },
  },
}

export const earningsButtonMotionProps = {
  whileHover: { scale: 1.03, transition: earningsCardHoverTransition },
  whileTap: { scale: 0.97, transition: { duration: 0.15 } },
}

/** Inputs: smooth focus ring (use with className) */
export const earningsInputFocusClass =
  'transition-[box-shadow,border-color] duration-200 focus-visible:border-[#895129]/45 focus-visible:ring-2 focus-visible:ring-[#895129]/20'
