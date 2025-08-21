import Logo from '@/assets/betconsulting_logo.png';

export default function BetconsultingLogo({ className }: { className?: string }) {
    return <img src={Logo} alt="Betconsulting Logo" className={className} />;
}
