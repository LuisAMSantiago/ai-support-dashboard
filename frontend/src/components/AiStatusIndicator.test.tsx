import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CombinedAiStatus } from './AiStatusIndicator';
import { isAnyAiJobProcessing } from '@/hooks/useTickets';
import type { AiJobStatus } from '@/types';

describe('AI job states', () => {
  it.each([
    ['queued', 'done', 'failed', 'IA processando', true],
    ['done', 'processing', 'idle', 'IA processando', true],
    ['done', 'idle', 'queued', 'IA processando', true],
    ['done', 'failed', 'idle', 'IA erro', false],
    ['done', 'idle', 'idle', 'IA pronta', false],
    ['idle', 'idle', 'idle', null, false],
  ] as [AiJobStatus, AiJobStatus, AiJobStatus, string | null, boolean][])(
    'renders %s/%s/%s consistently with polling', (summaryStatus, replyStatus, priorityStatus, label, polling) => {
      const { container } = render(<CombinedAiStatus {...{ summaryStatus, replyStatus, priorityStatus }} />);
      if (label) expect(screen.getByText(label)).toBeInTheDocument();
      else expect(container).toBeEmptyDOMElement();
      expect(isAnyAiJobProcessing(summaryStatus, replyStatus, priorityStatus)).toBe(polling);
    },
  );
});
