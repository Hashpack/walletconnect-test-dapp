import { useState } from "react";
import { useSignMessage } from "wagmi";
import { useLogger } from "../hooks/useLogger";

export function SignMessage() {
  const [message, setMessage] = useState("Hello Hedera!");
  const { addMessage } = useLogger();
  const { signMessageAsync, isPending } = useSignMessage();

  const handleSign = async () => {
    try {
      const signature = await signMessageAsync({ message });
      addMessage("Message signed", "", { signature });
    } catch (error) {
      addMessage("Sign message failed", "", error);
    }
  };

  return (
    <div className="action-form">
      <label>
        Message
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
      </label>
      <button onClick={handleSign} disabled={isPending}>
        {isPending ? "Signing..." : "Sign Message"}
      </button>
    </div>
  );
}
