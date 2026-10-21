<?php

namespace Database\Factories;

use App\Enums\EmailLogSource;
use App\Enums\EmailLogStatus;
use App\Models\EmailLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmailLog>
 */
class EmailLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'status' => EmailLogStatus::Sent,
            'source' => EmailLogSource::LeadNotification,
            'recipients' => fake()->safeEmail(),
            'from_address' => fake()->safeEmail(),
            'subject' => fake()->sentence(4),
            'body' => '<p>'.fake()->paragraph().'</p>',
            'mailer' => 'smtp',
        ];
    }

    public function failed(): static
    {
        return $this->state(fn (): array => [
            'status' => EmailLogStatus::Failed,
            'body' => null,
            'error' => 'Connection could not be established.',
        ]);
    }
}
