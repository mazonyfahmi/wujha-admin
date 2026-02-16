<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * Trait Filterable
 *
 * Provides reusable query filtering scopes for Eloquent models.
 * Eliminates repeated search/date-range/exact-match filter code across controllers.
 *
 * Usage in Model:
 *   use Filterable;
 *   protected array $searchable = ['name', 'email']; // columns to search
 *
 * Usage in Controller:
 *   $query = Model::filter($request->only(['search', 'status', 'from_date', 'to_date']));
 */
trait Filterable
{
    /**
     * Apply filters to the query.
     *
     * @param Builder $query
     * @param array $filters  Associative array of filter key => value
     * @return Builder
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        // Search across searchable columns
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $searchable = $this->searchable ?? [];

            if (!empty($searchable)) {
                $query->where(function (Builder $q) use ($search, $searchable) {
                    foreach ($searchable as $i => $column) {
                        // Support relationship search: 'relation.column'
                        if (str_contains($column, '.')) {
                            [$relation, $col] = explode('.', $column, 2);
                            $method = $i === 0 ? 'whereHas' : 'orWhereHas';
                            $q->$method($relation, function (Builder $rq) use ($col, $search) {
                                $rq->where($col, 'like', "%{$search}%");
                            });
                        } else {
                            $method = $i === 0 ? 'where' : 'orWhere';
                            $q->$method($column, 'like', "%{$search}%");
                        }
                    }
                });
            }
        }

        // Date range filters
        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }
        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        // Exact-match filters (status, state, payment_method, etc.)
        $exactFilters = $this->filterable ?? [];
        foreach ($exactFilters as $column) {
            if (!empty($filters[$column])) {
                $query->where($column, $filters[$column]);
            }
        }

        return $query;
    }
}
