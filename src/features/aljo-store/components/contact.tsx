import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/shared/components/ui/input-group'

// Project Imports
import { formSchema } from '@/features/aljo-store/schemas/contact-schema'

export function ContactForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            message: ''
        }
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            const response = await fetch('https://hook.eu1.make.com/mr9do8jl77m42haz49l5g6tmfo2cszyl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                throw new Error('Failed to submit form')
            }

            toast.success('Message sent successfully!', {
                description: 'We will get back to you as soon as possible.',
                position: 'bottom-right'
            })

            form.reset()
        } catch {
            toast.error('Failed to send message.', {
                description: 'Please try again later.',
                position: 'bottom-right'
            })
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
                                    />
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
                    <Button type="button" variant="outline" onClick={() => form.reset()}>
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
