// Simplified hook to satisfy imports and prevent build errors
// You can replace this with a full Toaster later if needed

export function useToast() {
    return {
        toast: (props: any) => {
            console.log("Toast:", props);
            // In a real implementation this would dispatch to a context
        },
        dismiss: (id?: string) => { },
    };
}
