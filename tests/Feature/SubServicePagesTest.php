<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Services\SubServiceRelatedWork;
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

    public function test_each_service_category_redirects_to_its_section_on_the_services_page(): void
    {
        foreach (config('subservices') as $category) {
            $this->get("/services/{$category['slug']}")
                ->assertRedirect(route('services.index').'#'.$category['slug']);
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

    public function test_a_branding_sub_service_leads_with_matching_work_and_tops_up_from_the_branding_portfolio(): void
    {
        Project::factory()->create(['slug' => 'other-brand', 'tags' => ['Branding', 'Logo Design'], 'sort_order' => 1]);
        Project::factory()->create(['slug' => 'box-brand', 'tags' => ['Branding', 'Packaging'], 'sort_order' => 5]);
        Project::factory()->draft()->create(['slug' => 'draft-box', 'tags' => ['Packaging'], 'sort_order' => 0]);
        Project::factory()->create(['slug' => 'no-cover-box', 'tags' => ['Packaging'], 'image_path' => '', 'sort_order' => 0]);
        Project::factory()->create(['slug' => 'interface-box', 'tags' => ['Packaging'], 'work_group' => 'uiux', 'sort_order' => 0]);

        $this->get('/services/branding/packaging-design')
            ->assertInertia(fn ($page) => $page
                ->component('Services/SubShow')
                ->has('item.relatedWork', 2)
                ->where('item.relatedWork.0.slug', 'box-brand')
                ->where('item.relatedWork.0.related', true)
                ->where('item.relatedWork.0.href', '/work/box-brand')
                ->where('item.relatedWork.1.slug', 'other-brand')
                ->where('item.relatedWork.1.related', false));
    }

    public function test_pinned_work_leads_and_the_section_is_capped(): void
    {
        foreach (range(1, 6) as $order) {
            Project::factory()->create(['tags' => ['Branding', 'Visual Identity'], 'sort_order' => $order]);
        }
        Project::factory()->create(['slug' => 'sabdita-fashion', 'tags' => ['Branding'], 'sort_order' => 9]);

        $this->get('/services/branding/motion-branding')
            ->assertInertia(fn ($page) => $page
                ->has('item.relatedWork', SubServiceRelatedWork::LIMIT)
                ->where('item.relatedWork.0.slug', 'sabdita-fashion')
                ->where('item.relatedWork.0.related', true));
    }

    public function test_a_ui_ux_sub_service_draws_from_the_ui_ux_showcase(): void
    {
        $this->get('/services/ui-ux/design-system')
            ->assertInertia(fn ($page) => $page
                ->has('item.relatedWork', SubServiceRelatedWork::LIMIT)
                ->where('item.relatedWork.0.slug', 'sailor-digital')
                ->where('item.relatedWork.0.related', true)
                ->where('item.relatedWork.0.href', '/work/portfolio/uiux?project=sailor-digital'));

        $this->get('/services/ui-ux/saas-product-design')
            ->assertInertia(fn ($page) => $page
                ->where('item.relatedWork.0.slug', 'adlbl')
                ->where('item.relatedWork.0.related', true)
                ->where('item.relatedWork.1.related', false));
    }

    public function test_unknown_sub_service_slugs_return_404(): void
    {
        $this->get('/services/branding/no-such-sub-service')->assertStatus(404);
        $this->get('/services/no-such-category/no-such-sub-service')->assertStatus(404);
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
}
