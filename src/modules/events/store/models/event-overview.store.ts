/*
 * Copyright (c) 2020 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ExecutionEventLineageNode, ExecutionEventLineageOverview } from 'spline-api'
import { SgData } from 'spline-common'
import { ProcessingStore, SplineEntityStore } from 'spline-utils'

import { EventInfo, EventNodeControl } from '../../models'


export namespace EventOverviewStore {

    export type State = {
        nodes: SplineEntityStore.EntityState<ExecutionEventLineageNode>
        executionEventId: string | null
        graphData: SgData | null
        eventInfo: EventInfo | null
        loadingProcessing: ProcessingStore.EventProcessingState
        selectedNodeId: string | null
    }

    export function getDefaultState(): State {
        return {
            nodes: SplineEntityStore.getDefaultState<ExecutionEventLineageNode>(),
            executionEventId: null,
            graphData: null,
            eventInfo: null,
            loadingProcessing: ProcessingStore.getDefaultProcessingState(),
            selectedNodeId: null,
        }
    }

    export function reduceLineageOverviewData(state: State,
                                              executionEventId: string,
                                              lineageOverview: ExecutionEventLineageOverview): State {

        const targetEdge = lineageOverview.lineage.links
            .find(
                x => x.target === lineageOverview.executionEventInfo.targetDataSourceId,
            )
        const eventNode = targetEdge
            ? lineageOverview.lineage.nodes.find(x => x.id === targetEdge.source)
            : undefined


        return {
            ...state,
            nodes: SplineEntityStore.addAll(lineageOverview.lineage.nodes, state.nodes),
            graphData: {
                nodes: lineageOverview.lineage.nodes.map(nodeSource => EventNodeControl.toSgNode(nodeSource)),
                links: lineageOverview.lineage.links,
            },
            eventInfo: {
                id: executionEventId,
                name: eventNode ? eventNode.name : 'NaN',
                applicationId: lineageOverview.executionEventInfo.applicationId,
                executedAt: new Date(lineageOverview.executionEventInfo.timestamp),
            },
        }
    }

    export function selectNode(state: State, nodeId: string): ExecutionEventLineageNode | undefined {
        return SplineEntityStore.selectOne(nodeId, state.nodes)
    }

}