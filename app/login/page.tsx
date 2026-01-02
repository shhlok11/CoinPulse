import MotionSection from "@/components/MotionSection";
import SocialAuth from "@/components/SocialAuth";

const LoginPage = () => (
  <main className="auth-page">
    <MotionSection className="auth-wrapper" delay={0.1}>
      <SocialAuth />
    </MotionSection>
  </main>
);

export default LoginPage;
