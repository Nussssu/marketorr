<?php

namespace Tests\Feature;

use Database\Seeders\ServiceSeeder;
use Database\Seeders\SettingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubServicePagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(SettingSeeder::class);
        $this->seed(ServiceSeeder::class);
    }

    public function test_every_catalogue_sub_service_page_renders(): void
    {
        foreach (config('subservices') as $category) {
            foreach ($category['items'] as $item) {
                $this->get("/services/{$category['slug']}/{$item['slug']}")->assertStatus(200);
            }
        }
    }

    public function test_each_service_category_has_a_dedicated_page(): void
    {
        foreach (config('subservices') as $category) {
            $this->get("/services/{$category['slug']}")
                ->assertInertia(fn ($page) => $page
                    ->component('Services/Category')
                    ->where('category.slug', $category['slug'])
                    ->has('category.items', 6));
        }
    }

    public function test_the_rebranding_page_carries_its_case_study(): void
    {
        $this->get('/services/branding/rebranding')
            ->assertInertia(fn ($page) => $page
                ->component('Services/SubShow')
                ->has('item.case_study.sections', 8)
                ->where('item.case_study.sections.6.images', fn ($images) => count($images) === 6));
    }

    public function test_unknown_sub_service_slugs_return_404(): void
    {
        $this->get('/services/branding/no-such-sub-service')->assertStatus(404);
        $this->get('/services/no-such-category/no-such-sub-service')->assertStatus(404);
    }

    public function test_every_catalogue_category_page_renders(): void
    {
        foreach (config('subservices') as $category) {
            $this->get("/services/{$category['slug']}")->assertStatus(200);
        }
    }

    public function test_home_and_services_index_receive_the_sub_service_catalogue(): void
    {
        $this->get('/')
            ->assertInertia(fn ($page) => $page
                ->component('Home')
                ->where('subservices', config('subservices')));

        $this->get('/services')
            ->assertInertia(fn ($page) => $page
                ->component('Services/Index')
                ->where('subservices', config('subservices')));
    }

    public function test_dedicated_category_pages_receive_the_same_sub_service_copy_as_the_landing_page(): void
    {
        foreach (config('subservices') as $category) {
            $this->get("/services/{$category['slug']}")
                ->assertInertia(fn ($page) => $page
                    ->component('Services/Category')
                    ->where('category', $category));
        }
    }
}
