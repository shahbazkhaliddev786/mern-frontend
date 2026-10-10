import { useMutation } from '@tanstack/react-query'
import { profileService, type RequestEmailChangePayload } from '../services/profile.service'
import { getErrorMessage } from '@/shared/services/api'
import type { ApiResponse } from '@/shared/types/api'
import { toast } from 'react-toastify'

export function useRequestEmailChangeMutation() {
    return useMutation<ApiResponse<void>, Error, RequestEmailChangePayload>({
        mutationFn: (data) => profileService.requestEmailChange(data),
        onSuccess: (response) => {
            toast.success(response.message || 'We sent a code to your new email address.')
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Failed to send the code'))
        }
    })
}
