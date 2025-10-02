import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
        <p className="text-muted-foreground">
          Please read these Terms & Conditions carefully before using our
          services. By participating in our investment plans, you agree to be
          bound by these Terms.
        </p>

        {/* Introduction */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>
            These Terms & Conditions govern your participation in our
            investment-based services. Our platform utilizes advanced Algo
            Trading Bots and Aladdin Software, developed by BlackRock, to place
            trades. By leveraging artificial intelligence, big data, and Python
            based scripts, our system seeks to minimize human errors and market
            manipulation while maximizing returns.
          </p>
        </section>

        {/* Use of Service */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Use of Service</h2>
          <p>
            To access our services, individuals must complete registration and
            make the required investment deposit. Only serious and dedicated
            participants are encouraged to engage. Once your portfolio is
            created, you will have the ability to monitor profits as they grow
            in real time.
          </p>
          <p>
            The system operates 24/7 using High Frequency Trading (HFT) bots
            powered by Python-based algorithms. Aladdin Software executes trades
            across global markets, ensuring precision, automation, and
            consistency.
          </p>
        </section>

        {/* Deposits and Withdrawals */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Deposits & Withdrawals</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              A minimum deposit of <strong>₹24,700</strong> is required to begin
              investing.
            </li>
            <li>
              A standard withdrawal charge of <strong>₹700</strong> will be
              applied to each withdrawal request.
            </li>
            <li>
              After deduction of withdrawal charges, the remaining{" "}
              <strong>₹24,000</strong> along with your accumulated profit will
              be credited to your account.
            </li>
            <li>
              All investors must complete necessary payments including
              investment deposits, GST charges (if applicable), and withdrawal
              charges in order to process transactions and receive returns.
            </li>
          </ul>
        </section>

        {/* Profit & Risk */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Profit & Risk Disclaimer</h2>
          <p>
            Our plan operates as a{" "}
            <strong>"Guaranteed Loss Cover Plan with 3x Profit"</strong>. While
            our systems are designed to minimize risks and protect capital, you
            acknowledge that all forms of trading involve some degree of market
            exposure. Profits are distributed according to the automated trading
            system, which allocates returns based on the capital registered.
          </p>
          <p>
            Insurance mechanisms are in place to safeguard against unforeseen
            circumstances. However, by using this service, you accept that
            successful performance is dependent on market conditions and system
            execution.
          </p>
        </section>

        {/* Liability */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Company Responsibility</h2>
          <p>
            The company operates a large-scale, systematic investment strategy
            where pooled investor capital is utilized for automated trading. We
            assume responsibility for managing funds through our AI-driven
            systems, and historically, no losses have been recorded through our
            trading models. Nevertheless, participation is voluntary and at your
            discretion.
          </p>
        </section>

        {/* Changes */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Changes to Terms</h2>
          <p>
            We reserve the right to update or modify these Terms & Conditions at
            any time. Users will be notified of significant changes through
            appropriate communication channels. Continued use of our services
            after such changes constitutes your agreement to the revised Terms.
          </p>
        </section>

        {/* Acceptance */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Acceptance</h2>
          <p>
            By making a deposit and engaging with our services, you acknowledge
            that you have read, understood, and agreed to these Terms &
            Conditions. Completion of all required payments, including GST,
            investment deposits, and withdrawal charges, is mandatory for
            receiving your returns.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
