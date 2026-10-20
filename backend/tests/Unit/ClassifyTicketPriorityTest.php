<?php

namespace Tests\Unit\Jobs;

use App\Contracts\AiTicketServiceInterface;
use App\Jobs\ClassifyTicketPriority;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassifyTicketPriorityTest extends TestCase
{
    use RefreshDatabase;

    public function test_job_classifica_prioridade_com_sucesso(): void
    {
        $this->app->bind(AiTicketServiceInterface::class, function () {
            return new class implements AiTicketServiceInterface {
                public function summarize(Ticket $ticket): string
                {
                    return 'Resumo';
                }

                public function suggestReply(Ticket $ticket): string
                {
                    return 'Resposta';
                }

                public function classifyPriority(Ticket $ticket): string
                {
                    return 'high';
                }
            };
        });

        $ticket = Ticket::factory()->create([
            'priority' => 'medium',
            'ai_priority_status' => 'queued',
        ]);

        $job = new ClassifyTicketPriority($ticket->id);
        $job->handle(app(AiTicketServiceInterface::class));

        $ticket->refresh();

        $this->assertSame('high', $ticket->priority);
        $this->assertSame('done', $ticket->ai_priority_status);
        $this->assertDatabaseHas('ticket_events', [
            'ticket_id' => $ticket->id,
            'type' => 'ai_priority_done',
        ]);
        $event = $ticket->events()->where('type', 'ai_priority_done')->sole();
        $this->assertSame(['before' => 'medium', 'after' => 'high'], $event->meta);
    }
}
