// BetconsultingDashLogo.tsx
import BetconsultingLogo from './betconsulting-logo';

export default function BetconsultingDashLogo({ className }: { className?: string }) {
    return (
        <div className={` ${className || ''}`}>
            <BetconsultingLogo className="h-auto w-full" />
        </div>
    );
}
