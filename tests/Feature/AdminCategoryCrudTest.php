<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCategoryCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'parent_id' => null,
            'slug' => 'brand-design',
            'name' => 'Brand Design',
            'description' => 'Identity work of every shape.',
            'accent' => '#891FFB',
            'status' => 'published',
        ], $overrides);
    }

    public function test_an_admin_can_create_a_category(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/categories', $this->validPayload())
            ->assertRedirect('/admin/categories');

        $this->assertDatabaseHas('categories', [
            'slug' => 'brand-design',
            'name' => 'Brand Design',
            'parent_id' => null,
        ]);
    }

    public function test_a_category_can_be_nested_under_a_parent(): void
    {
        $parent = Category::factory()->create();

        $this->actingAs($this->admin)
            ->post('/admin/categories', $this->validPayload([
                'slug' => 'packaging',
                'name' => 'Packaging',
                'parent_id' => $parent->id,
            ]))
            ->assertRedirect('/admin/categories');

        $this->assertDatabaseHas('categories', [
            'slug' => 'packaging',
            'parent_id' => $parent->id,
        ]);
    }

    public function test_a_category_cannot_be_its_own_parent(): void
    {
        $category = Category::factory()->create();

        $this->actingAs($this->admin)
            ->put("/admin/categories/{$category->id}", $this->validPayload([
                'slug' => $category->slug,
                'parent_id' => $category->id,
            ]))
            ->assertSessionHasErrors('parent_id');
    }

    public function test_a_duplicate_slug_is_rejected(): void
    {
        Category::factory()->create(['slug' => 'taken-slug']);

        $this->actingAs($this->admin)
            ->post('/admin/categories', $this->validPayload(['slug' => 'taken-slug']))
            ->assertSessionHasErrors('slug');
    }

    public function test_a_category_may_keep_its_own_slug_on_update(): void
    {
        $category = Category::factory()->create(['slug' => 'my-slug']);

        $this->actingAs($this->admin)
            ->put("/admin/categories/{$category->id}", $this->validPayload([
                'slug' => 'my-slug',
                'name' => 'Renamed',
            ]))
            ->assertRedirect('/admin/categories');

        $this->assertSame('Renamed', $category->fresh()->name);
    }

    public function test_deleting_a_category_unfiles_its_projects_rather_than_deleting_them(): void
    {
        $category = Category::factory()->create();
        $project = Project::factory()->create(['category_id' => $category->id]);

        $this->actingAs($this->admin)
            ->delete("/admin/categories/{$category->id}")
            ->assertRedirect();

        $this->assertSoftDeleted($category);
        $this->assertNotSoftDeleted($project);
        $this->assertNull($project->fresh()->category_id);
    }

    public function test_deleting_a_parent_promotes_its_children_to_the_top_level(): void
    {
        $parent = Category::factory()->create();
        $child = Category::factory()->create(['parent_id' => $parent->id]);

        $this->actingAs($this->admin)->delete("/admin/categories/{$parent->id}");

        $this->assertNull($child->fresh()->parent_id);
    }

    public function test_reordering_persists_the_new_positions(): void
    {
        $first = Category::factory()->create(['sort_order' => 0]);
        $second = Category::factory()->create(['sort_order' => 1]);

        $this->actingAs($this->admin)
            ->patch('/admin/categories/reorder', ['ids' => [$second->id, $first->id]])
            ->assertRedirect();

        $this->assertSame(0, $second->fresh()->sort_order);
        $this->assertSame(1, $first->fresh()->sort_order);
    }

    public function test_guests_cannot_reach_the_category_module(): void
    {
        $this->get('/admin/categories')->assertRedirect('/admin/login');
        $this->post('/admin/categories', $this->validPayload())->assertRedirect('/admin/login');
    }
}
