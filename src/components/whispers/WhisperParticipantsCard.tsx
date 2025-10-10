"use client";

interface WhisperParticipant {
  id: string;
  name: string;
  colorClass: string;
  role?: string;
  status?: "online" | "busy" | "away";
}

interface WhisperParticipantsCardProps {
  participants: WhisperParticipant[];
}

const statusDot: Record<NonNullable<WhisperParticipant["status"]>, string> = {
  online: "bg-emerald-500",
  busy: "bg-orange-500",
  away: "bg-yellow-400",
};

const WhisperParticipantsCard = ({ participants }: WhisperParticipantsCardProps) => {
  const hasParticipants = participants.length > 0;

  return (
    <section
      data-anim="online"
      className="flex flex-1 min-h-0 flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-4 shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Team members online</h3>
        <div className="text-xs text-neutral-500">{participants.length} online</div>
      </div>
      {hasParticipants ? (
        <ul className="mt-3 space-y-2 flex-1 overflow-auto pr-1">
          {participants.map((participant) => {
            const status = participant.status ?? "online";
            const dot = statusDot[status] ?? statusDot.online;
            return (
              <li key={participant.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-white ${participant.colorClass}`}
                  >
                    {participant.name[0]}
                  </div>
                  <div>
                    <span className="text-sm text-neutral-800 dark:text-neutral-200">{participant.name}</span>
                    {participant.role && (
                      <div className="text-[11px] text-neutral-500">{participant.role}</div>
                    )}
                  </div>
                </div>
                <span className={`inline-block w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-neutral-900 ${dot}`} />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-4 flex flex-1 items-center justify-center rounded-xl border border-dashed border-neutral-300/70 dark:border-neutral-700/60 bg-neutral-50/60 dark:bg-neutral-900/30 px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          When teammates post whispers, we’ll highlight who is active here.
        </div>
      )}
    </section>
  );
};

export type { WhisperParticipant };
export default WhisperParticipantsCard;
