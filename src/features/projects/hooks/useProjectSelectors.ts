import { useState, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { CustomTextData, SavedConfiguration } from '@shared/types'
import { GUEST_PROJECT_ID } from '@shared/types'
import { buildCustomTextFingerprint } from '@shared/utils'
import { useProjectStore } from '@features/projects'
import { useUser } from '@features/auth/store/authStore'

const EMPTY_LIST: SavedConfiguration[] = []

export function getActiveList(s: ReturnType<typeof useProjectStore.getState>) {
  if (s.activeProjectId === GUEST_PROJECT_ID) {
    return s.guestConfigurations
  }
  return s.remoteConfigurations[s.activeProjectId] ?? EMPTY_LIST
}

export const useMyList = () => useProjectStore(useShallow((s) => getActiveList(s)))

export const useMyListCount = () => useProjectStore((s) => getActiveList(s).length)

export const useProjectMeta = () =>
  useProjectStore(
    useShallow((s) => {
      if (s.activeProjectId === GUEST_PROJECT_ID) {
        return s.guestProjectMeta
      }
      const project = s.projects.find((p) => p.id === s.activeProjectId)
      if (!project) return s.guestProjectMeta
      return {
        projectName: project.name,
        clientName: project.clientName,
        createdAt: new Date(project.createdAt).getTime(),
        updatedAt: new Date(project.updatedAt).getTime(),
        date: project.date,
        lastExportedAt: project.lastExportedAt
          ? new Date(project.lastExportedAt).getTime()
          : null,
      }
    }),
  )

export const useIsProductInMyList = (
  productCode: string | null,
  customText?: CustomTextData | null,
) =>
  useProjectStore((s) => {
    if (!productCode) return false
    const list = getActiveList(s)
    const fingerprint = buildCustomTextFingerprint(customText)
    return list.some(
      (item) =>
        item.productCode === productCode &&
        buildCustomTextFingerprint(item.customText) === fingerprint,
    )
  })

export const useIsProductInAnyProject = (
  productCode: string | null,
  customText: CustomTextData | null,
  refreshToken: number,
) => {
  const user = useUser()
  const checkProductInAnyProject = useProjectStore((s) => s.checkProductInAnyProject)
  const [isInAnyProject, setIsInAnyProject] = useState(false)

  useEffect(() => {
    if (!productCode || !user) {
      setIsInAnyProject(false)
      return
    }
    checkProductInAnyProject(user.id, productCode, customText).then(setIsInAnyProject)
  }, [
    productCode,
    user?.id,
    buildCustomTextFingerprint(customText),
    refreshToken,
    checkProductInAnyProject,
  ])

  return isInAnyProject
}

export const useMyListItemIdByProductCode = (
  productCode: string | null,
  customText?: CustomTextData | null,
) =>
  useProjectStore((s) => {
    if (!productCode) return null
    const list = getActiveList(s)
    const fingerprint = buildCustomTextFingerprint(customText)
    const item = list.find(
      (c) =>
        c.productCode === productCode &&
        buildCustomTextFingerprint(c.customText) === fingerprint,
    )
    return item?.id ?? null
  })
