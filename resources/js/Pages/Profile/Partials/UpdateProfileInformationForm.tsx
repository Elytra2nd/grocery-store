// resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.tsx
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { FormEventHandler } from 'react';
import { PageProps, User } from '@/types';

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}

interface ProfileFormData {
    name: string;
    email: string;
    [key: string]: any;
}

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }: Props) {
    // Perbaiki: Type assertion yang benar
    const pageProps = usePage<PageProps>().props;
    const user = pageProps.auth.user as User;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<ProfileFormData>({
        name: user.name || '',
        email: user.email || '',
    }) as ReturnType<typeof useForm<ProfileFormData>> & {
        errors: Partial<Record<keyof ProfileFormData, string>>;
    };

    // Explicitly type setData to accept keys of ProfileFormData
    const setProfileData = setData as <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void;

    // Helper type for setData key
    type ProfileFormKey = keyof ProfileFormData;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>

                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setProfileData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />

                    {errors.name && <div className="mt-2 text-sm text-red-600">{errors.name}</div>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setProfileData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    {errors.email && (
                        <div className="mt-2 text-sm text-red-600">{errors.email}</div>
                    )}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm mt-2 text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 font-medium text-sm text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        Save
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
