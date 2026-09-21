<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateGlobalBlockRequest;
use App\Models\GlobalBlock;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GlobalBlockController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Blocks/Index', [
            'blocks' => GlobalBlock::query()
                ->orderBy('name')
                ->get()
                ->map(fn (GlobalBlock $block) => [
                    'id' => $block->id,
                    'key' => $block->key,
                    'name' => $block->name,
                    'type' => $block->type,
                    'content' => $block->content ?? [],
                    'enabled' => $block->enabled,
                ]),
        ]);
    }

    public function update(UpdateGlobalBlockRequest $request, GlobalBlock $block): RedirectResponse
    {
        $block->update($request->validated());

        return back()->with('success', $block->name.' saved.');
    }
}
