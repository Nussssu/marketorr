<?php

namespace Tests\Feature;

use App\Models\GlobalBlock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminGlobalBlockTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private GlobalBlock $banner;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
        $this->banner = GlobalBlock::query()->create([
            'key' => GlobalBlock::ANNOUNCEMENT_KEY,
            'name' => 'Announcement banner',
            'type' => 'banner',
            'enabled' => false,
            'content' => ['message' => 'Original', 'linkLabel' => '', 'linkUrl' => '', 'accent' => '#891FFB'],
        ]);
    }

    public function test_an_admin_can_edit_a_block(): void
    {
        $this->actingAs($this->admin)
            ->put("/admin/blocks/{$this->banner->id}", [
                'name' => 'Announcement banner',
                'enabled' => true,
                'content' => ['message' => 'Booking Q3', 'linkLabel' => 'Enquire', 'linkUrl' => '/contact', 'accent' => '#507AF4'],
            ])
            ->assertRedirect();

        $fresh = $this->banner->fresh();

        $this->assertTrue($fresh->enabled);
        $this->assertSame('Booking Q3', $fresh->content['message']);
    }

    public function test_a_disabled_banner_is_not_shared_with_the_public_site(): void
    {
        $this->get('/')->assertInertia(fn ($inertia) => $inertia->where('announcement', null));
    }

    public function test_an_enabled_banner_is_shared_with_the_public_site(): void
    {
        $this->banner->update(['enabled' => true]);

        $this->get('/')->assertInertia(fn ($inertia) => $inertia
            ->where('announcement.message', 'Original'));
    }

    public function test_guests_cannot_edit_blocks(): void
    {
        $this->get('/admin/blocks')->assertRedirect('/admin/login');
        $this->put("/admin/blocks/{$this->banner->id}", [])->assertRedirect('/admin/login');
    }
}
