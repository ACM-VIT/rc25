import FallbackScreen from "./fallback-screen";

interface FallbackPageProps {
  title: string;
  message: string;
  headerTitle?: string;
  actionLabel?: string;
  actionHref?: string;
  googleSignIn?: boolean;
}

export default function FallbackPage({
  title,
  message,
  headerTitle,
  actionLabel,
  actionHref,
  googleSignIn,
}: FallbackPageProps) {
  return (
    <FallbackScreen
      title={title}
      message={message}
      headerTitle={headerTitle}
      actionLabel={actionLabel}
      actionHref={actionHref}
      googleSignIn={googleSignIn}
    />
  );
}
