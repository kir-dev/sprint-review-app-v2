import { LoadingLogo } from "@/components/ui/LoadingLogo";

export default function ProfileLoading() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <LoadingLogo size={60} />
    </div>
  );
}
