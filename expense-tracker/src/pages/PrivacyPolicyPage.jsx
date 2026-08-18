function P({ children }) {
  return <p className="text-white/60 text-sm leading-relaxed mb-4">{children}</p>
}

// Public, unauthenticated page — Play Console (and any store reviewer) needs
// a real URL it can open directly, which the in-app Settings modal version
// of this text can't provide since Settings sits behind login.
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg font-sans px-6 py-12">
      <div className="mx-auto max-w-[560px]">
        <h1 className="text-white text-2xl font-semibold mb-6">Privacy Policy</h1>

        <P>Okana is designed with your privacy as the top priority.</P>
        <P><strong className="text-white/80">Data storage:</strong> All your financial data is stored securely in Supabase with row-level security. Only you can access your own data.</P>
        <P><strong className="text-white/80">No selling:</strong> We do not sell, share, or monetise your personal data in any way.</P>
        <P><strong className="text-white/80">Authentication:</strong> Login is handled by Supabase Auth with industry-standard encryption.</P>
        <P><strong className="text-white/80">Payments:</strong> Okana Plus subscription payments are processed by Razorpay, a PCI-DSS compliant payment gateway. Okana never sees or stores your card number, CVV, or full payment details — Razorpay handles that directly, and we only keep a masked reference (e.g. card network and last 4 digits) so we can show your saved payment method.</P>
        <P><strong className="text-white/80">Analytics:</strong> No third-party analytics or tracking libraries are used in this app.</P>
        <P><strong className="text-white/80">Deletion:</strong> You can erase all your data or delete your account at any time from the Account page. Deleting your account also cancels any active Okana Plus subscription.</P>
        <P><strong className="text-white/80">Contact:</strong> Questions about this policy can be sent to kushalbaragi@gmail.com.</P>

        <p className="text-white/25 text-xs mt-8">Last updated: August 2026</p>
      </div>
    </div>
  )
}
