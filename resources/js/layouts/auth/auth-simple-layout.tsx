// import BetconsultingLogo from '@/components/betconsulting-logo';
import BtpconsultingDarkLogo from '@/components/btpconsulting-logo-dark';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center">
                        <Link href={route('home')} className="flex flex-col items-center">
                            <div className="mb-1 mb-5 flex h-[100px] w-[198px] items-center justify-center">
                                <BtpconsultingDarkLogo className="overflow-hidden rounded-tl-[0px] rounded-tr-[35px] rounded-br-[0px] rounded-bl-[35px]" />

                                {/* <BtpconsultingDarkLogo className="overflow-hidden rounded-tl-[0px] rounded-tr-[50px] rounded-br-[0px] rounded-bl-[50px] border border-gray-200 shadow-lg" /> */}
                            </div>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
