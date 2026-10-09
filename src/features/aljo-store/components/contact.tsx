import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import * as z from 'zod'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/shared/components/ui/input-group'

// Project Imports
import { formSchema } from '@/features/aljo-store/schemas/contact-schema'
import { supportService } from '@/features/aljo-store/services/support.service'
import { useProfileQuery } from '@/features/users/hooks/useProfileQuery'

export function ContactForm() {
    // Signed-in users write as their account: the server uses its name and email, so the form shows them read-only.
    const { data: profileData } = useProfileQuery()
    const account = profileData?.data

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: ''
        }
    })

    useEffect(() => {
        if (account) {
            form.setValue('name', account.name)
            form.setValue('email', account.email)
        }
    }, [account, form])

    const resetForm = () => form.reset({ name: account?.name ?? '', email: account?.email ?? '', subject: '', message: '' })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            await supportService.submit(data)
            toast.success('Message sent successfully! We will get back to you as soon as possible.')
            resetForm()
        } catch {
            toast.error('Failed to send message. Please try again later.')
        }
    }

    return (
        <Card className="w-full shadow-elegant">
            <CardHeader>
                <CardTitle className="font-display text-xl">Send a Message</CardTitle>
                <CardDescription>We're here to help. Reach out with any questions or concerns.</CardDescription>
            </CardHeader>
            <CardContent>
                <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-name">Name</FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-rhf-name"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your name"
                                        autoComplete="name"
                                        readOnly={Boolean(account)}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-email">Email</FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-rhf-email"
                                        type="email"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        readOnly={Boolean(account)}
                                    />
                                    {account && <FieldDescription>You're signed in, so we'll reply to your account email.</FieldDescription>}
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="subject"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-subject">Subject</FieldLabel>
                                    <Input {...field} id="form-rhf-subject" aria-invalid={fieldState.invalid} placeholder="What is this about?" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="message"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-message">Message</FieldLabel>
                                    <InputGroup>
                                        <InputGroupTextarea
                                            {...field}
                                            id="form-rhf-message"
                                            placeholder="Enter your message"
                                            rows={6}
                                            className="min-h-24 resize-none"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <InputGroupAddon align="block-end">
                                            <InputGroupText className="tabular-nums">{field.value?.length || 0}/500 characters</InputGroupText>
                                        </InputGroupAddon>
                                    </InputGroup>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <Button type="button" variant="outline" onClick={resetForm}>
                        Reset
                    </Button>
                    <Button type="submit" variant="accent" form="form-rhf-demo" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}
