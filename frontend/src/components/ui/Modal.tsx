import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg"
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
}) => {
    if (!isOpen) return null;

    const sizeClass = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
    };

    return <>
        <div className="fixed inset-0 bg-ink/60 flex justify-center items-center z-50 p-4">
            <div
                 className={`
                    bg-paper rounded-2xl shadow-xl w-full ${sizeClass[size]} p-6
                `}
            >
                <div className="flex justify-between items-center mb-4">
                    {title && <h2 className="font-display text-xl text-ink">{title}</h2>}
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-ink/40 hover:text-ink cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="mb-4">
                    {children}
                </div>

                {footer && <div className="mt-4">{footer}</div>}
            </div>
        </div>
    </>
}

export default Modal;
