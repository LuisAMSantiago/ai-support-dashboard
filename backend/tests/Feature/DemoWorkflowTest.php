<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DemoWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_ticket_can_wait_close_reopen_and_be_restored_from_trash(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $data = ['title' => 'Erro de acesso', 'description' => 'O cliente não consegue acessar o painel.', 'priority' => 'medium'];
        $id = $this->postJson('/api/tickets', $data)->assertCreated()->json('data.id');

        foreach (['waiting', 'closed', 'open'] as $status) {
            $this->patchJson("/api/tickets/{$id}", [...$data, 'status' => $status])
                ->assertOk()->assertJsonPath('data.status', $status);
            $ticket = Ticket::findOrFail($id);
            $status === 'closed' ? $this->assertNotNull($ticket->closed_at) : $this->assertNull($ticket->closed_at);
        }

        $this->deleteJson("/api/tickets/{$id}")->assertOk();
        $this->getJson('/api/tickets/trashed')->assertOk()->assertJsonCount(1, 'data');
        $this->postJson("/api/tickets/{$id}/restore")->assertOk();
        $this->getJson("/api/tickets/{$id}/activity")->assertOk()->assertJsonFragment(['type' => 'restored']);
        $this->deleteJson("/api/tickets/{$id}")->assertOk();
        $this->deleteJson("/api/tickets/{$id}/force")->assertOk();
        $this->assertDatabaseMissing('tickets', ['id' => $id]);
    }

    public function test_analytics_and_history_only_include_the_authenticated_users_tickets(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        Ticket::factory()->create(['created_by' => $owner->id, 'status' => 'open', 'created_at' => now()->subDays(15)]);
        Ticket::factory()->create(['created_by' => $other->id, 'status' => 'open', 'created_at' => now()->subDays(15)]);
        Sanctum::actingAs($owner);

        $this->getJson('/api/tickets/summary')->assertOk()->assertJsonPath('data.total_active', 1);
        $this->getJson('/api/tickets/backlog')->assertOk()->assertJsonPath('data.counts.older_than_14_days', 1)->assertJsonCount(1, 'data.oldest_open');
    }
}
