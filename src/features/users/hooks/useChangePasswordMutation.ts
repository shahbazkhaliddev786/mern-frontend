import { useMutation } from '@tanstack/react-query'
import { profileService, type ChangePasswordPayload } from '../services/profile.service'
import { getErrorMessage } from '@/shared/services/api'
import type { ApiResponse } from '@/shared/types/api'
import { useAppDispatch } from '@/shared/store/hooks'
import { setTokens } from '@/features/authentication/slices/auth-slice'
import type { AuthTokens } from '@/features/authentication/types'
import { toast } from 'react-toastify'

export function useChangePasswordMutation() {
    const dispatch = useAppDispatch()

    return useMutation<ApiResponse<AuthTokens>, Error, ChangePasswordPayload>({
        mutationFn: (data) => profileService.changePassword(data),
        onSuccess: (response) => {
            // Every other session was revoked; these tokens keep this device signed in
            dispatch(setTokens(response.data))
            toast.success(response.message || 'Password updated')
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Failed to update password'))
        }
    })
}
