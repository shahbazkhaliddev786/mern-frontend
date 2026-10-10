import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService, type ProfileResponse, type UpdateProfileData } from '../services/profile.service'
import { getErrorMessage } from '@/shared/services/api'
import { useAppDispatch } from '@/shared/store/hooks'
import { updateUser } from '@/features/authentication/slices/auth-slice'
import { toast } from 'react-toastify'

export function useUpdateProfileMutation() {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    return useMutation<ProfileResponse, Error, UpdateProfileData>({
        mutationFn: (data) => profileService.updateProfile(data),
        onSuccess: (data) => {
            toast.success(data.message || 'Profile updated successfully')
            // Keep the header menu's name and avatar current
            const { name, profile } = data.data
            dispatch(updateUser(profile ? { name, profile } : { name }))
            // Invalidate and refetch profile data
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Failed to update profile'))
        }
    })
}
