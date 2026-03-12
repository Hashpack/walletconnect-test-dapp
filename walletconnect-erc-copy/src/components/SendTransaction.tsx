import { useState } from "react";
import { useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { useLogger } from "../hooks/useLogger";

export function SendTransaction() {
  const [to, setTo] = useState("");
  const [value, setValue] = useState("0");
  const [data, setData] = useState("");
  const { addMessage } = useLogger();
  const { sendTransactionAsync, isPending } = useSendTransaction();

  const handleSend = async () => {
    try {
      const hash = await sendTransactionAsync({
        to: to as `0x${string}`,
        value: parseEther(value),
        data: data ? (data as `0x${string}`) : undefined,
      });
      addMessage("Transaction sent", "", { hash });
    } catch (error) {
      addMessage("Transaction failed", "", error);
    }
  };

  return (
    <div className="action-form">
      <label>
        To (address)
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="0x..."
        />
      </label>
      <label>
        Value (HBAR)
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
        />
      </label>
      <label>
        Data (hex, optional)
        <input
          type="text"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="0x..."
        />
      </label>
      <button onClick={handleSend} disabled={isPending || !to}>
        {isPending ? "Sending..." : "Send Transaction"}
      </button>
    </div>
  );
}
