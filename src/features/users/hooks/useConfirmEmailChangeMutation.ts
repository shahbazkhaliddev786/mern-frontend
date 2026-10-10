import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService } from '../services/profile.service'
import { getErrorMessage } from '@/shared/services/api'
import type { ApiResponse } from '@/shared/types/api'
import { useAppDispatch } from '@/shared/store/hooks'
import { updateUser } from '@/features/authentication/slices/auth-slice'
import { toast } from 'react-toastify'

export function useConfirmEmailChangeMutation() {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    return useMutation<ApiResponse<{ email: string }>, Error, string>({
        mutationFn: (otp) => profileService.confirmEmailChange(otp),
        onSuccess: (response) => {
            dispatch(updateUser({ email: response.data.email }))
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            toast.success(response.message || 'Email address updated')
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Failed to confirm the code'))
        }
    })
}
