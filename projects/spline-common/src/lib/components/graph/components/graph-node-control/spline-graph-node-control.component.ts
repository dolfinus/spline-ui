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

import {
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    Type,
} from '@angular/core'
import { BaseDynamicContentComponent } from 'spline-utils'

import { ISgNodeControl, SgNodeControlEvent, SgNodeSchema } from '../../models'
import { SplineGraphNodeManager } from '../../services'

import { SgNodeDefault } from './type'
import decorateDefaultSgNodeSchema = SgNodeDefault.decorateDefaultSchema


@Component({
    selector: 'spline-graph-node-control',
    templateUrl: './spline-graph-node-control.component.html',
})
export class SplineGraphNodeControlComponent<TData extends object, TOptions extends object = {}>
    extends BaseDynamicContentComponent<ISgNodeControl<TData, TOptions>> implements OnChanges {

    @Input() schema: SgNodeSchema<TData, TOptions>
    @Output() event$ = new EventEmitter<SgNodeControlEvent<TData>>()

    constructor(protected readonly componentFactoryResolver: ComponentFactoryResolver,
                protected readonly splineGraphNodeManager: SplineGraphNodeManager) {
        super(componentFactoryResolver)
    }

    get componentType(): Type<ISgNodeControl<TData, TOptions>> {
        return this.splineGraphNodeManager.getComponentType(this.schema?.type)
    }

    ngOnChanges(changes: SimpleChanges): void {
        const schemaChange = changes['schema']
        if (schemaChange) {
            this.rebuildComponent()
        }
    }

    protected initCreatedComponent(componentRef: ComponentRef<ISgNodeControl<TData, TOptions>>): void {
        // initialize component
        const instance = componentRef.instance
        instance.schema = !this.schema?.type
            ? decorateDefaultSgNodeSchema(this.schema) as SgNodeSchema<TData, TOptions>
            : this.schema

        console.log(instance.schema)

        this.eventsSubscriptionRefs.push(
            instance.event$.subscribe((event) => this.event$.emit(event)),
        )
    }

}
